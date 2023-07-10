/** Run this script on your home machine. It will run in a loop to fetch all the servers in the network
 *  analyze them. Figure out which ones can be hacked and which can be used to hack. Then spreads the scripts around
 *  with a relatively optimal RAM usage. TODO: Optimize when the scripts are run to not overlap. It's moneymaking optimal. Not sure if exp making optimal.
 * @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  // ns.killall('home');
  // if (!ns.isRunning("expand_servers.js")) {
  const expandPid = ns.exec("expand_servers.js", 'home');
  if (expandPid != 0)
    ns.tprint("Started server expand loop");
  // }
  //1. analyze all servers for hack/grow/weaken information along with possibility to hack it and times it would take
  //2. at first filter out those that don't fit our level or amount of ports openable
  //3. sort them by how easy it is to hack them
  //4. calculate the overall amount of available threads worldwide for load distribution
  //5. iterate, execute the script which fits the most and save information on the currently executed process and amount of threads

  // contains ALL the servers on the network
  let allServers = {
    // counts on how many threads we can currently run a script on
    runnableScriptThreads() {
      let totalRunnableScriptThreads = 0;
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].canExecute)
            totalRunnableScriptThreads += this[server].hackability.runnableScriptThreads;
        }
      }
      return totalRunnableScriptThreads;
    },
    hackableServers() {
      const hackable = {};
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].hackable)
            hackable[server] = this[server];
        }
      }
      return hackable;
    },
    sortByHackingLevel() {
      const sortedHash = {};
      const keys = Object.keys(this);

      keys.sort((a, b) => {
        const hackingLevelA = this[a].hackability.requiredHackingLevel;
        const hackingLevelB = this[b].hackability.requiredHackingLevel;
        return hackingLevelA - hackingLevelB;
      });

      keys.forEach(key => {
        sortedHash[key] = this[key];
      });

      return sortedHash;
    },
    // returns servers we can hack sorted by difficulty
    hackableSortedByHackingLevel() {
      const hackable = this.hackableServers();
      const sortedHash = {};
      const keys = Object.keys(hackable);

      keys.sort((a, b) => {
        const hackingLevelA = hackable[a].hackability.requiredHackingLevel;
        const hackingLevelB = hackable[b].hackability.requiredHackingLevel;
        return hackingLevelA - hackingLevelB;
      });

      keys.forEach(key => {
        sortedHash[key] = hackable[key];
      });
      sortedHash.first = function () {
        const firstKey = Object.keys(this)[0];
        const firstValue = this[firstKey];

        return firstValue;
      }

      sortedHash.shift = function () {
        const firstKey = Object.keys(this)[0];
        const firstValue = this[firstKey];

        delete sortedHash[firstKey];

        return firstValue;
      }
      return sortedHash;
    },
    // filters out all the servers which we can hack on
    executingServers() {
      const executing = {};
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].canExecute) {
            executing[server] = this[server];
          }
        }
      }
      // returns a pool of servers which will fullfil the requested threadscount
      executing.serverPool = function (threadsToFullfill) {
        let pool = {};
        let threadsFound = 0;
        while (threadsToFullfill > threadsFound) {
          const keys = Object.keys(this);
          if (keys.length == 2) // maybe this can be done better - we need to skip functions
            break;
          const firstKey = keys[0];

          if (this.hasOwnProperty(firstKey) && typeof this[firstKey] === 'object') {
            const firstValue = this[firstKey];
            threadsFound += firstValue.hackability.runnableScriptThreads;
            pool[firstKey] = firstValue;
            if (threadsToFullfill >= firstValue.hackability.runnableScriptThreads)
              delete this[firstKey];
          }
        }
        return pool;
      }
      executing.totalRunnableScriptThreads = function () {
        let totalRunnableScriptThreads = 0;
        for (const server in this) {
          if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
            totalRunnableScriptThreads += this[server].hackability.runnableScriptThreads;
          }
          return totalRunnableScriptThreads;
        }
      }
      return executing;
    },
  }

  let runningScripts = {
    cleanup() {
      for (const server in this) {
        let now = new Date();
        let scripts = this[server];
        for (const script in scripts) {
          if (scripts[script].endsAt <= now)
            delete scripts[script]
        }
      }
    }
  }
  while (true) {
    let visited = [];
    await recursive_scan(ns, 'home', visited);
    runningScripts.cleanup();
    const openablePorts = numberOfPortsOpenable(ns);

    // scan all servers
    for (const serv of visited) {
      allServers[serv] = analyzeServer(ns, serv, runningScripts, openablePorts);
    }
    // lets run
    await run_script(ns, runningScripts, allServers.executingServers(), allServers.hackableSortedByHackingLevel(), allServers.runnableScriptThreads());
    await ns.sleep(200);
  }
}

/** @param {NS} ns 
 * @param {Hash<Object>} runningScripts Server to search through
 * @param {Hash<ServerAnalysis>} execServers Server to search through
 * @param {Hash<ServerAnalysis>} hackableServers Server to search through
 * @param {number} runnableScriptThreads Threads Server to search through
*/
export async function run_script(ns, runningScripts, execServers, hackableServers) {
  //0. based on the available threads, we need to see how many hacks we can run
  //1. check which script to run based on current security level and money available
  //2. run the script saving info when was it ran and how much time should it be executed.. 
  //   potentially when should it finish, to cleanup the executing table at that time
  //3. here's the tricky part: we could try to estimate and overlap the next hack/weaken/growth cycles
  //   this can be calculated somewhat like: if weaken is running for 20 seconds and hack will take 10 seconds
  //   run the hack after the 10 seconds of the weaken run.. same aplies to the next grow cycle
  let threadsLeft = execServers.totalRunnableScriptThreads();
  while (threadsLeft > 0) {
    const serverToHack = hackableServers.shift();
    if (!serverToHack || !serverToHack.name || serverToHack.name == '') break;

    crackPorts(ns, serverToHack.name);
    let execPool = execServers.serverPool(serverToHack.recommended.requiredThreads);

    for (const servName in execPool) {
      let execServ = execPool[servName];
      if (execServ.hackability.runnableScriptThreads <= 0) continue; // we depleted the runnable threads in a previous loop

      const thNo = Math.min(execServ.hackability.runnableScriptThreads, serverToHack.recommended.requiredThreads);

      copyScripts(ns, ['hack.js', 'grow.js', 'weaken.js'], execServ.name);
      crackPorts(ns, execServ.name);
      let scriptPid = ns.exec(serverToHack.recommended.scriptName + '.js', execServ.name, thNo, 20, serverToHack.name);
      if (scriptPid != 0) {
        if (!runningScripts[serverToHack.name]) runningScripts[serverToHack.name] = [];
        runningScripts[serverToHack.name].push({
          pid: scriptPid,
          type: serverToHack.recommended.scriptName,
          startedAt: new Date(),
          runTime: serverToHack.recommended.runTime,
          endsAt: new Date(new Date().getTime() + serverToHack.recommended.runTime)
        });
        execServ.hackability.runnableScriptThreads -= thNo;
        threadsLeft -= thNo;
      }
      else
        ns.print("Couldn't run " + serverToHack.recommended.scriptName + " on " + execServ.name + " targeting " + serverToHack.name + ". Threads: " + thNo);
    }
  }
}

/** Maps the network and populates the 'visited' array with network names including 'home' and purchased servers
 *  @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {Array<string>} visited Already visited servers array which gets populated as output
*/
export async function recursive_scan(ns, serv, visited) {
  visited.push(serv);

  for (const serv2 of ns.scan(serv)) {
    if (!visited.includes(serv2)) {
      await recursive_scan(ns, serv2, visited);
    }
  }
}

/** 
 * @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {string} runningScripts Currently running scripts
 * */
export function analyzeServer(ns, target, runningScripts, openablePorts) {
  let moneyMax = ns.getServerMaxMoney(target);
  let moneyAvailable = ns.getServerMoneyAvailable(target);
  let growthThreads = 0;
  let moneyToMax;
  let securityIncreaseOnGrowth;
  let hackChance = ns.hackAnalyzeChance(target);
  let hackThreads = Math.ceil(1 / ns.hackAnalyze(target));

  let securityIncreaseOnHack = ns.hackAnalyzeSecurity(hackThreads, target);
  let securityMin = ns.getServerMinSecurityLevel(target);
  let securityCurrent = ns.getServerSecurityLevel(target);
  let securityDiff = securityCurrent - securityMin;

  let weakenThreads = threadsToWeaken(ns, securityDiff);
  if (moneyAvailable != moneyMax) {
    moneyToMax = moneyMax - moneyAvailable;
    if (moneyAvailable == 0) moneyAvailable = 1; // this is kinda stupid, but infinity doesn't work, so :/
    let multiplier = moneyToMax / moneyAvailable;
    if (multiplier < 1 && multiplier > 0) multiplier = 1;
    if (target != 'home') growthThreads = Math.ceil(ns.growthAnalyze(target, multiplier));
    securityIncreaseOnGrowth = ns.growthAnalyzeSecurity(growthThreads);
  }
  let growScriptRam = ns.getScriptRam('grow.js');
  let hackScriptRam = ns.getScriptRam('hack.js');
  let weakenScriptRam = ns.getScriptRam('weaken.js');
  let growth = ns.getServerGrowth(target);
  let timeWeaken = Math.ceil(ns.getWeakenTime(target));
  let timeGrowth = Math.ceil(ns.getGrowTime(target));
  let timeHack = Math.ceil(ns.getHackTime(target));

  let requiredHackingLevel = ns.getServerRequiredHackingLevel(target);

  let usedRam = ns.getServerUsedRam(target);
  let maxRam = ns.getServerMaxRam(target);
  let availableRam = maxRam - usedRam;
  if (target == 'home') availableRam -= 30;

  let recommendedScript;
  if (moneyMax != 0) {
    if (moneyAvailable != moneyMax && growthThreads > 0) recommendedScript = 'grow';
    else {
      if (securityCurrent != securityMin) recommendedScript = 'weaken';
      else recommendedScript = 'hack';
    }
  }
  let running = runningScripts[target];

  let requiredThreads;
  let runTime;
  switch (recommendedScript) {
    case 'weaken':
      requiredThreads = weakenThreads;
      runTime = timeWeaken;
      break;
    case 'hack':
      requiredThreads = hackThreads;
      runTime = timeHack;
      break;
    case 'grow':
      requiredThreads = growthThreads;
      runTime = timeGrowth;
      break;
  };
  const analysis = new ServerAnalysis();
  analysis.name = target;
  // not sure this is correct
  analysis.canExecute = target == 'home' || target.includes('pserv') || (ns.getServerNumPortsRequired(target) <= openablePorts && ns.getServerMaxRam(target) > 0);
  analysis.hackable = moneyMax != 0 && ns.getServerNumPortsRequired(target) <= openablePorts && requiredHackingLevel <= ns.getHackingLevel();
  analysis.weaken = {
    time: timeWeaken,
    threadsToWeakenToMin: weakenThreads,
    securityCurrent: securityCurrent,
    securityMin: securityMin,
    securityDiff: securityDiff,
    scriptRam: weakenScriptRam,
    ramToRunAllThreads: weakenScriptRam * weakenThreads,
  };
  analysis.hack = {
    threadsToStealAll: hackThreads,
    time: timeHack,
    securityIncrease: securityIncreaseOnHack,
    requiredHackingLevel: requiredHackingLevel,
    moneyAvailable: moneyAvailable,
    moneyMax: moneyMax,
    hackChance: hackChance,
    portsRequired: ns.getServerNumPortsRequired(target),
    ramToRunAllThreads: hackScriptRam * hackThreads,
  };
  analysis.growth = {
    threads: growthThreads,
    securityIncrease: securityIncreaseOnGrowth,
    time: timeGrowth,
    moneyToMax: moneyToMax,
    ramToGrowToMax: growScriptRam * growthThreads,
    growthParameter: growth
  };
  analysis.hackability = {
    maxRam: ns.getServerMaxRam(target),
    portsRequired: ns.getServerNumPortsRequired(target),
    usedRam: usedRam,
    availableRam: availableRam,
    runnableScriptThreads: Math.floor(availableRam / weakenScriptRam),
    requiredHackingLevel: requiredHackingLevel,
  };
  analysis.recommended = {
    scriptName: recommendedScript,
    requiredThreads: requiredThreads,
    runTime: runTime
  };
  return analysis;
}

/** Calculates how many threads are required to decrease the security by this many levels
 * @param {NS} ns 
 * @param {number} securityLevelsToDecrease
 * */
export function threadsToWeaken(ns, securityLevelsToDecrease) {
  let threads = 0;
  while (ns.weakenAnalyze(threads) < securityLevelsToDecrease) {
    threads++;
  }
  return threads;
}

/** @param {NS} ns 
 * @param {Array<string>} scriptNames scripts to send
 * @param {string} target where to send
*/
export function copyScripts(ns, scriptNames, target) {
  scriptNames.forEach((name) => {
    ns.scp(name, target);
  });
}

/** @param {NS} ns
 *  @param {String} target
*/
export async function crackPorts(ns, target) {
  try {
    if (ns.fileExists('BruteSSH.exe', 'home'))
      ns.brutessh(target);
    if (ns.fileExists('FTPCrack.exe', 'home'))
      ns.ftpcrack(target);
    if (ns.fileExists('relaySMTP.exe', 'home'))
      ns.relaysmtp(target);
    if (ns.fileExists('HTTPWorm.exe', 'home'))
      ns.httpworm(target);
    if (ns.fileExists('SQLInject.exe', 'home'))
      ns.sqlinject(target);
    ns.nuke(target);
    return true;
  }
  catch {
    // most probably ports not open
    return false;
  }
}

/** @param {NS} ns */
export function numberOfPortsOpenable(ns) {
  let count = 0;
  if (ns.fileExists('BruteSSH.exe', 'home'))
    count++;
  if (ns.fileExists('FTPCrack.exe', 'home'))
    count++;
  if (ns.fileExists('relaySMTP.exe', 'home'))
    count++;
  if (ns.fileExists('HTTPWorm.exe', 'home'))
    count++;
  if (ns.fileExists('SQLInject.exe', 'home'))
    count++;
  return count;
}

class ServerAnalysis {
  constructor() {
    this.weaken = {};
    this.hack = {};
    this.growth = {};
    this.hackability = {};
    this.recommended = {};
    this.name = 'Server name';
    this.hackable = false;
    this.canExecute = false;
  };
}