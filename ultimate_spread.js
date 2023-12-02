import { recursive_scan, totalRam } from 'common'
import { getConfiguration } from 'helpers.js'

const argsSchema = [
  ['noUpgrades', false], // Don't upgrade the servers - both pservers and hacknet
  ['useHacknet', true], // Don't upgrade the servers - both pservers and hacknet

];
export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}
let runOptions;
/** Run this script on your home machine. It will run in a loop to fetch all the servers in the network
 *  analyze them. Figure out which ones can be hacked and which can be used to hack. Then spreads the scripts around
 *  with a relatively optimal RAM usage. TODO: Optimize when the scripts are run to not overlap. It's really hard to make this optimal.
 * @param {NS} ns */
export async function main(ns) {

  runOptions = getConfiguration(ns, argsSchema);
  // let noExpand = ns.args[0];
  ns.disableLog('ALL');
  if (!runOptions.noUpgrades) {
    const expandPid = ns.exec("upgrade_servers.js", 'home');
    if (expandPid != 0)
      ns.tprint("Started server upgrade loop");
  }
  // const servers = new Servers(ns, "", true);
  const servers = new Servers(ns, "", runOptions.useHacknet);
  // const servers = new Servers(ns, "hacknet", true);
  while (true) {
    servers.update();
    run_script(ns, servers);
    await ns.sleep(1);
  }
}

/** @param {NS} ns 
 * @param {Servers} allServers Server to search through
*/
function run_script(ns, allServers) {
  let threadsLeft = allServers.totalRunnableScriptThreads();

  let hackable;
  if (ns.getPlayer().skills.hacking < 3000)
    hackable = allServers.sortByHackingLevel();
  else
    hackable = allServers.sortByHackingLevelDesc();

  // const hackable2 = allServers.sortByMoneyFlowRate();
  const totalThreadsRequired = allServers.totalThreadsRequired();
  while (threadsLeft > 0) {
    const serverToHack = hackable.shift();
    if (!serverToHack) break;
    if (threadsLeft < serverToHack.recommended.requiredThreads) continue;
    let execPool = allServers.serverPool(serverToHack.recommended.requiredThreads);

    for (const execServ of execPool) {
      if (execServ.hackability.runnableScriptThreads <= 0) continue; // we depleted the runnable threads in a previous loop

      const thNo = Math.min(execServ.hackability.runnableScriptThreads, serverToHack.recommended.requiredThreads);

      // let scriptPid = ns.exec(serverToHack.recommended.scriptNameExt, execServ.name, thNo, 1, serverToHack.name);
      // if (scriptPid != 0) {
      //   if (serverToHack.name == 'catalyst')
      //     ns.print(`Benchmark catalyst. Script: ${serverToHack.recommended.scriptName} runTime: ${serverToHack.recommended.runTime} threads: ${thNo} running on: ${execServ.name}`)
      //   if (!allServers.runningScripts[serverToHack.name]) allServers.runningScripts[serverToHack.name] = [];
      //   allServers.runningScripts[serverToHack.name].push({
      //     pid: scriptPid,
      //     type: serverToHack.recommended.scriptName,
      //     startedAt: new Date(),
      //     hackedOn: execServ.name,
      //     threads: thNo,
      //     runTime: serverToHack.recommended.runTime,
      //     endsAt: new Date(new Date().getTime() + serverToHack.recommended.runTime)
      //   });
      //   execServ.hackability.runnableScriptThreads -= thNo;
      //   threadsLeft -= thNo;
      // }
      // else
      //   ns.print(`Couldn't run ${serverToHack.recommended.scriptName} on ${execServ.name} targeting ${serverToHack.name}. Threads: ${thNo}`);

      let split = 1;
      if (totalThreadsRequired < threadsLeft) {

        //   // those are just some magic numbers. might require tweaking, but the results are good
        //   // split = 24;
        //   // if (serverToHack.recommended.runTime > split) // 186t  12b
        //   // {
        //   //   split = serverToHack.recommended.runTime / 28;
        //   //   if (serverToHack.recommended.scriptName == 'grow')
        //   //     split = split / 3;
        //   //   if (serverToHack.recommended.scriptName == 'weaken')
        //   //     split = split / 10;
        //   // }
        //   // else split = 1;

        split = 24;
        if (serverToHack.recommended.runTime > split) // 186t  12b
        {
          // if (serverToHack.recommended.scriptName == 'hack')
          split = serverToHack.recommended.runTime / 28;
          if (serverToHack.recommended.scriptName == 'grow')
            split = split / 3;
          if (serverToHack.recommended.scriptName == 'weaken')
            split = split / 8;
        }
        else split = 1;
      }

      let count = split;
      // if (serverToHack.name == 'ecorp')
      //   console.log(`${serverToHack.name}: ${serverToHack.recommended.scriptName} - ${serverToHack.recommended.runTime}`);
      while (count-- > 0) {
        let wait = count == split || count == 0 ? 1 : Math.ceil(serverToHack.recommended.runTime / split * count);
        if (wait < 0) wait = 0;
        // let scriptPid = ns.exec(serverToHack.recommended.scriptName + '.js', execServ.name, thNo, 1, serverToHack.name);
        let scriptPid = ns.exec(serverToHack.recommended.scriptName + '.js', execServ.name, thNo, wait, serverToHack.name);
        if (scriptPid != 0) {
          // if (serverToHack.name == 'catalyst')
          //   ns.print(`Benchmark catalyst. Script: ${serverToHack.recommended.scriptName}runTime: ${serverToHack.recommended.runTime} threads: ${thNo} running on: ${execServ.name}`)
          if (!allServers.runningScripts[serverToHack.name]) allServers.runningScripts[serverToHack.name] = [];
          allServers.runningScripts[serverToHack.name].push({
            //  pid: scriptPid,
            type: serverToHack.recommended.scriptName,
            //  startedAt: new Date(),
            //  hackedOn: execServ.name,
            // threads: thNo,
            // runTime: serverToHack.recommended.runTime,
            endsAt: new Date(new Date().getTime() + serverToHack.recommended.runTime)
          });

          // allServers.runningScripts[serverToHack.name] = {
          //   //  pid: scriptPid,
          //   type: serverToHack.recommended.scriptName,
          //   //  startedAt: new Date(),
          //   //  hackedOn: execServ.name,
          //   // threads: thNo,
          //   // runTime: serverToHack.recommended.runTime,
          //   endsAt: new Date(new Date().getTime() + serverToHack.recommended.runTime)
          // };
          execServ.hackability.runnableScriptThreads -= thNo;
          threadsLeft -= thNo;
        }
        else
          ns.print(`Couldn't run ${serverToHack.recommended.scriptName} on ${execServ.name} targeting ${serverToHack.name}. Threads: ${thNo}`);
      }

    }
    // await ns.sleep(1);
  }
}

export class Servers {
  /** @param {NS} ns */
  constructor(ns, namePart = "", useHacknet = false, useNetwork = false) {
    this.namePart = namePart;
    this.ns = ns;
    this.useHacknet = useHacknet;
    this.runningScripts = {};
    let visited = [];
    ServerAnalysis.portsOpenable = this.numberOfPortsOpenable = 0;
    // we need to reset the static stuff after augmentation
    ServerAnalysis.hackTools = {
      brutessh: false,
      ftpcrack: false,
      relaysmtp: false,
      httpworm: false,
      sqlinject: false,
    };
    /**
   * @type {ServerAnalysis[]}
   * @description This is a static property that holds a string value.
   */
    this.allServers = [];
    recursive_scan(this.ns, 'home', visited);
    for (const serv of visited) {
      if (namePart === "" || serv.includes(this.namePart))
        this.allServers.push(new ServerAnalysis(ns, serv));
    }
  }
  update() {
    this.runningScriptsCleanup();
    if (this.numberOfPortsOpenable < 5)
      this.numberOfPortsOpenable = ServerAnalysis.numberOfPortsOpenable(this.ns);
    for (const serv of this.allServers) {
      // if (this.namePart === "" || serv.name.includes(this.namePart))
      serv.update(this.runningScripts[serv.name], this.numberOfPortsOpenable, this.ns.getServer('home').cpuCores)
    }
  }

  runningScriptsCleanup() {
    for (const server in this.runningScripts) {
      let now = new Date();
      let scripts = this.runningScripts[server];
      for (const script in scripts) {
        if (scripts[script].endsAt <= now)
          delete scripts[script]
      }
    }
  }

  executable() {
    const executable = [];
    for (const server of this.allServers) {
      if (server.name.includes('hacknet') && !this.useHacknet) continue;
      
      if (!server.name.includes(this.namePart)) continue;
      if (server.canExecute)
        executable.push(server);
    }
    return executable;
  }

  // counts on how many threads we can currently run a script on
  runnableScriptThreads() {
    let totalRunnableScriptThreads = 0;
    for (const server of this.allServers) {
      if (server.canExecute)
        totalRunnableScriptThreads += server.hackability.runnableScriptThreads;
    }
    return totalRunnableScriptThreads;
  };

  hackable() {
    const hackable = [];
    for (const server of this.allServers) {
      if (server.hackable)
        hackable.push(server);
    }
    return hackable;
  };
  sortByMoneyFlowRate() {
    return this.hackable().sort((a, b) => b.moneyFlowRate - a.moneyFlowRate);
  };
  sortByHackingLevelDesc() {
    return this.hackable().sort((a, b) => b.hackability.requiredHackingLevel - a.hackability.requiredHackingLevel);
  };
  sortByHackingLevel() {
    return this.hackable().sort((a, b) => a.hackability.requiredHackingLevel - b.hackability.requiredHackingLevel);
  };

  totalRunnableScriptThreads() {
    let totalRunnableScriptThreads = 0;
    for (const server of this.allServers) {
      if (server.hackability.runnableScriptThreads)
        totalRunnableScriptThreads += server.hackability.runnableScriptThreads;
    }
    return totalRunnableScriptThreads;
  };

  totalThreadsRequired() {
    let totalRunnableScriptThreads = 0;
    for (const server of this.hackable()) {
      totalRunnableScriptThreads += server.recommended.requiredThreads;
    }
    return totalRunnableScriptThreads;
  };
  serverPool(threadsToFullfill) {
    let pool = [];
    let threadsFound = 0;
    const execs = this.executable();
    let serv = execs.shift();
    while (threadsToFullfill > threadsFound) {
      if (!serv) break;
      if (serv.hackability.runnableScriptThreads > 0) {
        threadsFound += serv.hackability.runnableScriptThreads;
        pool.push(serv);
      }
      serv = execs.shift();
    }
    return pool;
  }
}

class ServerAnalysis {
  /** @param {NS} ns */
  constructor(ns, target) {
    this.ns = ns;
    this.name = target;
    // TODO: maybe make a money/second and exp / second prognosis
    const serv = ns.getServer(target);
    this.maxRam = serv.maxRam;
    this.weakenScriptRam = ns.getScriptRam('weaken.js');
    this.cpuCores = serv.cpuCores;
    this.hackability = {
      maxRam: serv.maxRam,
      portsRequired: ns.getServerNumPortsRequired(target),
      requiredHackingLevel: ns.getServerRequiredHackingLevel(target),
      hasAdminRights: serv.hasAdminRights
    };

    ns.scp(['hack.js', 'grow.js', 'weaken.js'], target, 'home');
    // this.update(null, ServerAnalysis.numberOfPortsOpenable(ns));
  };

  /** Updates the Server information with current state. 
   * And proposes a recommended next script based on the previous script that was/is running.
   * It's also somewhat optimal, but probably far from it.
   * @param {Array} runningScripts 
   * @param {number} openablePorts 
   * @param {number} homeCores 
   * */
  update(runningScripts, openablePorts, homeCores) {
    const target = this.name;
    this.moneyMax = this.ns.getServerMaxMoney(target);
    this.securityMin = this.ns.getServerMinSecurityLevel(target);
    if (this.name == 'home' && this.cpuCores < 8)
      this.cpuCores = this.ns.getServer(target).cpuCores;
    if (this.name.includes('pserv') || this.name == 'home')
      this.maxRam = this.ns.getServerMaxRam(target);
    this.usedRam = this.ns.getServerUsedRam(target);


    this.canExecute = this.name == 'home' ||
      this.name.includes('pserv') ||
      (this.hackability.portsRequired <= openablePorts &&
        this.maxRam > 0);

    // if (!this.hackability.hasAdminRights) // TODO: make sure what opening ports does: allows execution or hacking? confirmed: allows execution
    this.crackPorts(openablePorts);

    this.hackability.availableRam = this.maxRam - this.usedRam;
    if (target == 'home') {
      const externals = ramNeededForExternalScripts(this.ns);
      this.hackability.availableRam -= externals;
      this.hackability.availableRam -= ramForStanek(this.ns, this.hackability.availableRam);
    }
    this.hackability.runnableScriptThreads = Math.floor(this.hackability.availableRam / this.weakenScriptRam);

    this.hackable = this.moneyMax != 0 && this.hackability.portsRequired <= openablePorts && this.hackability.requiredHackingLevel <= this.ns.getHackingLevel();

    if (!this.hackable) return;

    // const cores = this.cpuCores;
    // const cores = 8;
    const cores = homeCores; // this made the script perform worse? at least on exp

    let moneyAvailable = this.ns.getServerMoneyAvailable(target);
    let growthThreads = 0;
    let moneyToMax;
    let securityIncreaseOnGrowth;

    let th = this.ns.hackAnalyze(target); // TODO that's broken - it's percentage of money stolen with a single thread
    let hackThreads = th > 1000000 || th == 0 ? 1 : Math.ceil(1 / th); // sometimes above 19k hacking we get inifinity threads required?

    // let weakenThreadsRightNow = threadsToWeaken(this.ns, securityDiff, cores);
    if (moneyAvailable != this.moneyMax) {
      moneyToMax = this.moneyMax - moneyAvailable;
      if (moneyAvailable == 0) moneyAvailable = 1; // this is kinda stupid, but infinity doesn't work, so :/
      let multiplier = moneyToMax / moneyAvailable;
      if (multiplier < 1 && multiplier > 0) multiplier = 1;
      if (multiplier == Infinity) multiplier = 1;
      if (target != 'home') growthThreads = Math.ceil(this.ns.growthAnalyze(target, multiplier, cores));
      securityIncreaseOnGrowth = this.ns.growthAnalyzeSecurity(growthThreads, target, cores); // TODO add cores on home
    }
    let requiredThreads;
    let runTime;
    let recommendedScript = 'hack';
    let lastScript;
    if (!runningScripts || runningScripts.length == 0 || !runningScripts[runningScripts.length - 1])
      // lastScript = { type: 'weaken' };
      if (moneyAvailable != this.moneyMax && growthThreads > 0) lastScript = { type: 'hack' };
      else {
        if (this.ns.getServerSecurityLevel(target) != this.securityMin) lastScript = { type: 'grow' };
        else lastScript = { type: 'weaken' };
      }
    else lastScript = runningScripts[runningScripts.length - 1];

    switch (lastScript.type) {
      case 'weaken':
        {
          recommendedScript = 'hack';
          requiredThreads = hackThreads;
          runTime = Math.ceil(this.ns.getHackTime(target));
        }
        break;
      case 'hack':
        {
          recommendedScript = 'grow';
          requiredThreads = growthThreads;
          runTime = Math.ceil(this.ns.getGrowTime(target));
        }
        break;
      case 'grow':
        {
          recommendedScript = 'weaken';
          let securityIncreaseOnHack = this.ns.hackAnalyzeSecurity(hackThreads, target);
          let securityCurrent = this.ns.getServerSecurityLevel(target);
          let securityDiff = securityCurrent - this.securityMin;

          // requiredThreads = threadsToWeaken(this.ns, securityDiff, cores);
          // got to calculate the security increase after the previous hack and grow
          let secLevelIncrease = securityDiff;
          if (securityIncreaseOnHack != Infinity)
            secLevelIncrease += securityIncreaseOnHack;
          if (securityIncreaseOnGrowth != Infinity)
            secLevelIncrease += securityIncreaseOnGrowth;
          requiredThreads = threadsToWeaken(this.ns, secLevelIncrease, cores); // this should be running machine, not where it is being analyzed
          // requiredThreads = threadsToWeaken(this.ns, secLevelIncrease); // this should be running machine, not where it is being analyzed
          runTime = Math.ceil(this.ns.getWeakenTime(target));;
        }
        break;
    };

    this.moneyFlowRate = this.moneyMax / runTime;
    this.recommended = {
      scriptName: recommendedScript,
      scriptNameExt: recommendedScript + '.js',
      requiredThreads: requiredThreads,
      runTime: runTime
    };
  }
  /** Installs hacks if enough is availabale 
   * @param {number} numberOfPortsOpenable */
  crackPorts(numberOfPortsOpenable) {
    if (this.hackability.portsRequired > numberOfPortsOpenable) return;
    if (ServerAnalysis.hackTools.brutessh)
      this.ns.brutessh(this.name);
    if (ServerAnalysis.hackTools.ftpcrack)
      this.ns.ftpcrack(this.name);
    if (ServerAnalysis.hackTools.relaysmtp)
      this.ns.relaysmtp(this.name);
    if (ServerAnalysis.hackTools.httpworm)
      this.ns.httpworm(this.name);
    if (ServerAnalysis.hackTools.sqlinject)
      this.ns.sqlinject(this.name);

    this.ns.nuke(this.name);
    this.hackability.hasAdminRights = true;
  }
  /** Hack tools available on the system, but is static so needs to be refreshed on code start.  */
  static hackTools = {
    brutessh: false,
    ftpcrack: false,
    relaysmtp: false,
    httpworm: false,
    sqlinject: false,
  };
  static portsOpenable = 0;
  /** calculates and updates the amount of Ports we can open. So which Hack tools are available. It checks and updates all.
   * @param {NS} ns */
  static numberOfPortsOpenable(ns) {
    // if (ServerAnalysis.portsOpenable == 5) return 5;
    let count = 0;
    if (!ServerAnalysis.hackTools.brutessh)
      if (ns.fileExists('BruteSSH.exe', 'home'))
        ServerAnalysis.hackTools.brutessh = true;

    if (!ServerAnalysis.hackTools.ftpcrack)
      if (ns.fileExists('FTPCrack.exe', 'home'))
        ServerAnalysis.hackTools.ftpcrack = true;

    if (!ServerAnalysis.hackTools.relaysmtp)
      if (ns.fileExists('relaySMTP.exe', 'home'))
        ServerAnalysis.hackTools.relaysmtp = true;

    if (!ServerAnalysis.hackTools.httpworm)
      if (ns.fileExists('HTTPWorm.exe', 'home'))
        ServerAnalysis.hackTools.httpworm = true;

    if (!ServerAnalysis.hackTools.sqlinject)
      if (ns.fileExists('SQLInject.exe', 'home'))
        ServerAnalysis.hackTools.sqlinject = true;

    if (ServerAnalysis.hackTools.brutessh) count++;
    if (ServerAnalysis.hackTools.ftpcrack) count++;
    if (ServerAnalysis.hackTools.relaysmtp) count++;
    if (ServerAnalysis.hackTools.httpworm) count++;
    if (ServerAnalysis.hackTools.sqlinject) count++;
    ServerAnalysis.portsOpenable = count;
    return count;
  }
}
ServerAnalysis.portsOpenable = 0;
// we need to reset the static stuff after each run just to be sure. Maybe static isn't a good idea after all
ServerAnalysis.hackTools = {
  brutessh: false,
  ftpcrack: false,
  relaysmtp: false,
  httpworm: false,
  sqlinject: false,
};
/** Calculates how many threads are required to decrease the security by this many levels
 * @param {NS} ns 
 * @param {number} securityLevelsToDecrease
 * @param {number} cores
 * */
function threadsToWeaken(ns, securityLevelsToDecrease, cores) {
  if (securityLevelsToDecrease == 0) return 1;
  if (securityLevelsToDecrease > 100000) return 1;
  // this also made the code run worse for whatever reason when a lot of ram is there
  // let levelDecreasedOnSingleThread = ns.weakenAnalyze(1, cores);
  // return Math.ceil(securityLevelsToDecrease / levelDecreasedOnSingleThread);
  let threads = 1;
  while (ns.weakenAnalyze(threads, cores) < securityLevelsToDecrease) {
    threads++;
  }
  return threads;
}
let ramNeeded = 0;
/** @param {NS} ns */
export function ramNeededForExternalScripts(ns) {
  // if (ramNeeded != 0) return ramNeeded;
  ramNeeded = 0;

  ramNeeded += countRamIfNotRunning(ns, 'singl.js');
  ramNeeded += countRamIfNotRunning(ns, 'background_loop.js');
  ramNeeded += countRamIfNotRunning(ns, 'stockmaster.js');
  ramNeeded += countRamIfNotRunning(ns, 'ultimate_spread.js');
  ramNeeded += countRamIfNotRunning(ns, 'sleeve.js');
  ramNeeded += countRamIfNotRunning(ns, 'infi_loop.js');
  ramNeeded += countRamIfNotRunning(ns, 'stats.js');
  ramNeeded += countRamIfNotRunning(ns, 'ganger.js');
  ramNeeded += countRamIfNotRunning(ns, 'backdoor_loop.js');
  ramNeeded += countRamIfNotRunning(ns, 'upgrade_servers.js');
  ramNeeded += countRamIfNotRunning(ns, 'jumpbd.js');
  // ramNeeded += ns.getScriptRam('corpo.js');

  if (ns.stanek.acceptGift())
    ramNeeded += countRamIfNotRunning(ns, 'lstanek.js');
  return ramNeeded;
}

export function ramForStanek(ns, homeRam) {
  let needed = 0;
  if (ns.stanek.acceptGift()) {
    let total = totalRam(ns);
    const ofTotal = Math.floor(total * 0.15);
    const ofHome = Math.floor(homeRam * 0.15);
    let ramReservedForStanek = 0;
    if (ofTotal > homeRam)
      ramReservedForStanek = homeRam;
    else
      ramReservedForStanek = ofTotal;
    localStorage.setItem('ramReservedForStanek', ramReservedForStanek);
    needed = ramReservedForStanek;

  }
  return needed;
}

function countRamIfNotRunning(ns, scriptName) {
  if (!ns.scriptRunning(scriptName, 'home')) return ns.getScriptRam(scriptName);
  return 0;
}

// function countRamIfNotRunning(ns, scriptName) {
//   return ns.getScriptRam(scriptName);
// }