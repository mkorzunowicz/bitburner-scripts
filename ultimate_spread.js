
/** @param {NS} ns */
export async function main(ns) {
  //1. let analyze all servers for hack/grow/weaken information along with possibility to hack it and times it would take
  //2. at first filter out those that don't fit our level or amount of ports openable
  //3. sort them by how easy it is to hack them
  //4. calculate the overall amount of available threads worldwide for load distribution
  //5. iterate, execute the script which fits the most and save information on the currently executed process and amount of threads
  let openablePorts;// = numberOfPortsOpenable(ns);
  let playerHackingLevel;// = ns.getHackingLevel();

  let allServers = {
    availableRam() {
      // not necessarily meaningful.. to delete
      let totalAvailableRam = 0;
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].hackability && typeof this[server].hackability.availableRam === 'number') {
            if (this[server].hackability.portsRequired <= openablePorts &&
              this[server].hackability.requiredHackingLevel <= playerHackingLevel
            )
              totalAvailableRam += this[server].hackability.availableRam;
          }
        }
      }
      return totalAvailableRam;
    },

    runnableScriptThreads() {
      let totalRunnableScriptThreads = 0;
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].hackability &&
            typeof this[server].hackability.runnableScriptThreads === 'number' &&
            this[server].hackability.portsRequired <= openablePorts &&
            this[server].hackability.requiredHackingLevel <= playerHackingLevel
          )
            totalRunnableScriptThreads += this[server].hackability.runnableScriptThreads;
        }
      }
      return totalRunnableScriptThreads;
    },

    hackableServers() {
      const hackable = {};
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].hack &&
            this[server].hackable &&
            this[server].hackability.portsRequired <= openablePorts &&
            this[server].hackability.requiredHackingLevel <= playerHackingLevel) {
            hackable[server] = this[server];
          }
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
    executingServers() {
      const executing = {};
      for (const server in this) {
        if (this.hasOwnProperty(server) && typeof this[server] === 'object') {
          if (this[server].hack &&
            this[server].hackability.maxRam > 0 &&
            this[server].hackability.portsRequired <= openablePorts &&
            this[server].hackability.requiredHackingLevel <= playerHackingLevel) {
            executing[server] = this[server];
          }
        }
      }
      executing.serverPool = function (threadsToFullfill) {
        let pool = {};
        let threadsFound = 0;
        while (threadsToFullfill > threadsFound) {
          const keys = Object.keys(this);
          if (keys.length == 1)
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
      return executing;
    },
  }

  let runningScripts = {
    cleanup() {
      for (const server in this) {
        let now = new Date();
        let scripts = this[server];
        for (const script in scripts) {
          let s = scripts[script];
          if (s.endsAt <= now)
            delete scripts[script]
        }
      }
    }
  }
  // ns.disableLog("ALL");
  // ns.killall('home');
  // // if (!ns.isRunning("expand_servers.js")) {
  // const expandPid = ns.exec("expand_servers.js", 'home');
  // if (expandPid != 0)
  //   ns.tprint("Started server expand loop");
  // // }
  let visited = [];

  while (true) {
    await recursive_scan(ns, 'home', visited);
    runningScripts.cleanup();
    openablePorts = numberOfPortsOpenable(ns);
    playerHackingLevel = ns.getHackingLevel();
    // scan all servers

    for (const serv of visited) {
      allServers[serv] = analyzeServer(ns, serv);
    }

    const runnableScriptThreads = allServers.runnableScriptThreads();
    // const hackable = allServers.hackableServers();
    const sorted = allServers.hackableSortedByHackingLevel();
    const execServers = allServers.executingServers();

    // lets run
    await run_script(ns, runningScripts, execServers, sorted, runnableScriptThreads);
    await ns.sleep(500);
  }
}

/** @param {NS} ns 
 * @param {Hash<Object>} runningScripts Server to search through
 * @param {Hash<ServerAnalysis>} execServers Server to search through
 * @param {Hash<ServerAnalysis>} hackableServers Server to search through
 * @param {number} runnableScriptThreads Threads Server to search through
*/
export async function run_script(ns, runningScripts, execServers, hackableServers, runnableScriptThreads) {
  //0. based on the available threads, we need to see how many hacks we can run
  //1. check which script to run based on current security level and money available
  //2. run the script saving info when was it ran and how much time should it be executed.. 
  //   potentially when should it finish, to cleanup the executing table at that time
  //3. here's the tricky part: we could try to estimate and overlap the next hack/weaken/growth cycles
  //   this can be calculated somewhat like: if weaken is running for 20 seconds and hack will take 10 seconds
  //   run the hack after the 10 seconds of the weaken run.. same aplies to the next grow cycle
  let threadsLeft = runnableScriptThreads;
  while (threadsLeft > 0) {
    const serverToHack = hackableServers.shift();
    if (!serverToHack || !serverToHack.name || serverToHack.name == '') break;

    crackPorts(ns, serverToHack.name);
    let requiredThreads;
    let runTime;
    switch (serverToHack.recommendedScript) {
      case 'weaken':
        requiredThreads = serverToHack.weaken.threadsToWeakenToMin;
        runTime = serverToHack.weaken.time;
        break;
      case 'hack':
        requiredThreads = serverToHack.hack.threadsToStealAll;
        runTime = serverToHack.hack.time;
        break;
      case 'grow':
        requiredThreads = serverToHack.growth.threads;
        runTime = serverToHack.growth.time;
        break;
    }
    let execPool = execServers.serverPool(requiredThreads);

    const waitBefore = 20; //ms

    for (const execServ in execPool) {
      if (!runningScripts[serverToHack.name])
        runningScripts[serverToHack.name] = [];

      let serv = execPool[execServ]
      let thNo;
      if (serv.hackability.runnableScriptThreads <= requiredThreads)
        thNo = serv.hackability.runnableScriptThreads;
      else thNo = requiredThreads;
      if (thNo <= 0) {
        continue; //that's a bug?
        // debugger;
      }

      copyScripts(ns, ['hack.js', 'grow.js', 'weaken.js'], serv.name);
      crackPorts(ns, serv.name);

      let scriptPid = ns.exec(serverToHack.recommendedScript + '.js', serv.name, thNo, waitBefore, serverToHack.name);
      if (scriptPid != 0) {
        runningScripts[serverToHack.name].push({
          pid: scriptPid,
          type: serverToHack.recommendedScript,
          startedAt: new Date(),
          runTime: runTime,
          endsAt: new Date(new Date().getTime() + runTime)
        });
        // ns.tail(scriptPid);
        threadsLeft -= requiredThreads;
        // debugger;
      }
    }
    // debugger;
    await ns.sleep(50);
  }
}

/** @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {Array<string>} visited Already visited servers
*/
export async function recursive_scan(ns, serv, visited) {
  let nextLevel = ns.scan(serv);
  visited.push(serv);

  for (let i = 0; i < nextLevel.length; ++i) {
    const serv2 = nextLevel[i];

    if (visited.includes(serv2))
      continue;
    await recursive_scan(ns, serv2, visited)
  }
}

/** @param {NS} ns */
export function analyzeServer(ns, target) {
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
    if (multiplier < 1 && multiplier > 0)
      multiplier = 1;
    // debugger;
    // if (multiplier > 10)
    // debugger;
    if (target != 'home')
      growthThreads = Math.ceil(ns.growthAnalyze(target, multiplier));
    securityIncreaseOnGrowth = ns.growthAnalyzeSecurity(growthThreads);
    // ns.formulas.hacking.growThreads
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
  if (target == 'home')
    availableRam -= 30;

  let recommendedScript;
  if (moneyMax != 0) {
    if (moneyAvailable != moneyMax && growthThreads > 0)
      recommendedScript = 'grow';
    else {
      if (securityCurrent != securityMin)
        recommendedScript = 'weaken';
      else
        recommendedScript = 'hack';
    }
  }
  // max :15, is: 5, diff: 10, 10/5=2
  // let multits = ns.getHackingMultipliers();
  // debugger;
  const analysis = new ServerAnalysis();
  analysis.name = target;
  analysis.hackable = moneyMax != 0;
  analysis.recommendedScript = recommendedScript;
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
  return analysis;
  // return {
  //   weaken: {
  //     time: timeWeaken,
  //     threadsToWeakenToMin: weakenThreads,
  //     securityCurrent: securityCurrent,
  //     securityMin: securityMin,
  //     securityDiff: securityDiff,
  //     scriptRam: weakenScriptRam,
  //     ramToRunAllThreads: weakenScriptRam * weakenThreads,
  //   },
  //   hack: {
  //     threadsToStealAll: hackThreads,
  //     time: timeHack,
  //     securityIncrease: securityIncreaseOnHack,
  //     requiredHackingLevel: requiredHackingLevel,
  //     moneyAvailable: moneyAvailable,
  //     moneyMax: moneyMax,
  //     hackChance: hackChance,
  //     portsRequired: ns.getServerNumPortsRequired(target),

  //     ramToRunAllThreads: hackScriptRam * hackThreads,

  //   },
  //   growth: {
  //     threads: growthThreads,
  //     securityIncrease: securityIncreaseOnGrowth,
  //     time: timeGrowth,
  //     moneyToMax: moneyToMax,
  //     ramToGrowToMax: growScriptRam * growthThreads,
  //     growthParameter: growth


  //   },
  //   hackability: {
  //     maxRam: ns.getServerMaxRam(target),
  //     portsRequired: ns.getServerNumPortsRequired(target),
  //     usedRam: usedRam,
  //     availableRam: availableRam,
  //     runnableScriptThreads: Math.floor(availableRam / weakenScriptRam),
  //     requiredHackingLevel: requiredHackingLevel,

  //   },
  //   name: target,
  //   hackable: moneyMax != 0,
  //   recommendedScript: recommendedScript
  // };
}

/** @param {NS} ns */
export function threadsToWeaken(ns, securityLevelsToDecrease) {
  if (securityLevelsToDecrease == 0) return 0;
  let weakenAmount = 0;
  let threads = 0;
  // debugger;
  while (securityLevelsToDecrease > weakenAmount) {
    weakenAmount = ns.weakenAnalyze(threads++);
  }
  return threads;
}


/** @param {NS} ns 
 * @param {string} serv Server to hack
*/
export async function run_hack(ns, serv) {
  const scriptName = "better_hacking.js";
  if (ns.isRunning(scriptName, serv)) return;

  if (ns.getServerNumPortsRequired(serv) > numberOfPortsOpenable(ns)) return;
  crackPorts(ns, serv);

  const availableRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
  if (availableRam < 8) return;

  let myLevel = ns.getHackingLevel();
  let servLevel = ns.getServerRequiredHackingLevel(serv);
  if (servLevel <= myLevel || serv == 'home') {
    copyScripts(ns, ['hack.js', 'grow.js', 'weaken.js'], serv);
    ns.tprint("Spreading to: " + serv);
    ns.print("Spreading to: " + serv);
    ns.exec(scriptName, serv, 1);
  }
  else {
    // ns.tprint("Didn't spread to: " + serv + ". My level:" + myLevel + " Req: " + servLevel);
  }
}

/** @param {NS} ns 
 * @param {Array<string>} scriptNames scripts to send
 * @param {string} serv where to send
*/
export function copyScripts(ns, scriptNames, serv) {
  scriptNames.forEach((name) => {
    ns.scp(name, serv);
  });
}


/** @param {NS} ns
 *  @param {String} serverName
*/
export async function crackPorts(ns, serverName) {

  try {
    if (ns.fileExists('BruteSSH.exe', 'home'))
      ns.brutessh(serverName);
    if (ns.fileExists('FTPCrack.exe', 'home'))
      ns.ftpcrack(serverName);
    if (ns.fileExists('relaySMTP.exe', 'home'))
      ns.relaysmtp(serverName);
    if (ns.fileExists('HTTPWorm.exe', 'home'))
      ns.httpworm(serverName);
    if (ns.fileExists('SQLInject.exe', 'home'))
      ns.sqlinject(serverName);
    ns.nuke(serverName);
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
    this.weaken = {
      // time: timeWeaken,
      // threadsToWeakenToMin: weakenThreads,
      // securityCurrent: securityCurrent,
      // securityMin: securityMin,
      // securityDiff: securityDiff,
      // scriptRam: weakenScriptRam,
      // ramToRunAllThreads: weakenScriptRam * weakenThreads,
    };
    this.hack = {
      // threadsToStealAll: hackThreads,
      // time: timeHack,
      // securityIncrease: securityIncreaseOnHack,
      // requiredHackingLevel: requiredHackingLevel,
      // moneyAvailable: moneyAvailable,
      // moneyMax: moneyMax,
      // hackChance: hackChance,
      // portsRequired: ns.getServerNumPortsRequired(target),

      // ramToRunAllThreads: hackScriptRam * hackThreads,

    };
    this.growth = {
      // threads: growthThreads,
      // securityIncrease: securityIncreaseOnGrowth,
      // time: timeGrowth,
      // moneyToMax: moneyToMax,
      // ramToGrowToMax: growScriptRam * growthThreads,
      // growthParameter: growth


    };
    this.hackability = {
      // maxRam: ns.getServerMaxRam(target),
      // portsRequired: ns.getServerNumPortsRequired(target),
      // usedRam: usedRam,
      // availableRam: availableRam,
      // runnableScriptThreads: Math.floor(availableRam / weakenScriptRam),
      // requiredHackingLevel: requiredHackingLevel,

    };
    this.name = 'Server name';
    this.hackable = false;
    this.recommendedScript = 'weaken';
  };

  // method() {
  //   console.log('Custom method');
  // }
}