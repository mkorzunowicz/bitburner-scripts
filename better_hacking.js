/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  // const executingServer = ns.args[0];
  // const target = ns.args[1];
  // if (!executingServer && !target) {
  //   ns.tprint("The script will try to weaken, grow, hack a server with the most amount of threads.");
  //   ns.tprint(`Usage: run ${ns.getScriptName()} executingServer target`);
  //   ns.tprint("Example:");
  //   ns.tprint(`> run ${ns.getScriptName()} CSEC`);
  //   return;
  // }
  let target;
  const executingServer = ns.getServer().hostname;
  const weakenScript = 'weaken.js'
  const growScript = 'grow.js'
  const hackScript = 'hack.js'
  // let times = 10;
  // while (times -= 1 > 0) {
  let shouldDrawTarget = target == null;
  while (true) {
    if (shouldDrawTarget)
      target = whatToHack(ns);

    // Defines how much money a server should have before we hack it
    // In this case, it is set to 65% of the server's max money
    const moneyThresh = ns.getServerMaxMoney(target) * 0.65;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    const crackedTarget = await crackPorts(ns, target);
    const crackedExec = await crackPorts(ns, executingServer);
    if (!crackedExec || !crackedTarget) return;

    if (ns.getServerSecurityLevel(target) > securityThresh) {
      ns.print('Weaken of ' + target + ' should take: ' + timeToS(ns.getWeakenTime(target)));

      // If the server's security level is above our threshold, weaken it
      await runScript(ns, weakenScript, executingServer, target);

    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      ns.print('Grow of ' + target + ' should take: ' + timeToS(ns.getGrowTime(target)));
      // If the server's money is less than our threshold, grow it
      await runScript(ns, growScript, executingServer, target);
    } else {
      ns.print('Hack of ' + target + ' should take: ' + timeToS(ns.getHackTime(target)));

      // Otherwise, hack it
      await runScript(ns, hackScript, executingServer, target);
    }
  }
  ns.tprint("Exiting.");
}

/** @param {NS} ns */
export function analyzeHack(ns, target) {
  
  let serverGrowth = ns.getServerGrowth(target);
  let weakTime = ns.getWeakenTime(target);
  let groTime = ns.getGrowTime(target);
  let hacTime = ns.getHackTime(target);
  let moneyStolenPerThread = ns.hackAnalyze(target);

  let minServerLevel = ns.getServerMinSecurityLevel(target);
  let moneyAvailable = ns.getServerMoneyAvailable(target);
  let requiredHackingLevel = ns.getServerRequiredHackingLevel(target);
  let maxMoney = ns.getServerMaxMoney(target);
  let securityLevel = ns.getServerSecurityLevel(target);

  // ns.hackAnalyzeThreads
}

/** @param {NS} ns */
async function runScript(ns, scriptName, executingServer, target) {
  const waitBefore = 20; //ms
  const startTime = new Date();
  // const scriptRam = ns.getScriptRam(scriptName, executingServer);
  const scriptRam = ns.getScriptRam('grow.js', executingServer);
  if (scriptRam == 0) {

    ns.tprint("ERROR " + "couldn't run script. Script not found: " + scriptName + ' targetting: ' + target + " on " + executingServer);
    // ns.print();
    await ns.sleep(300);
    return;
  }
  let availableRam = ns.getServerMaxRam(executingServer) - ns.getServerUsedRam(executingServer);
  if (executingServer == 'home') availableRam -= 30;
  // ns.tprint("Availble: " + availableRam + " script name" + scriptName + "script:" + scriptRam + ":" + executingServer);
  const threads = Math.floor(availableRam / scriptRam);

  if (threads <= 0) {
    ns.print("ERROR " + "couldn't run script. Not enough ram");
    await ns.sleep(300);
    return;
  }

  let scriptPid = ns.exec(scriptName, executingServer, threads, waitBefore, target);
  if (scriptPid != 0) {
    ns.print("SUCCESS " + "Running: " + scriptName + ' targetting: ' + target + " on " + executingServer + " in " + threads + " threads. PID: " + scriptPid);
    while (ns.isRunning(scriptPid))
      await ns.sleep(300);
  }
  else {
    await ns.sleep(300);
    ns.tprint("ERROR " + 'Failed running script: ' + scriptName + ' targetting: ' + target + " on " + executingServer + " in " + threads + " threads.");
  }
  ns.print('Script ' + scriptName + ' ended in: ' + timeToS(new Date() - startTime) + 's');
}

/** @param {NS} ns */
export function whatToHack(ns) {
  let noOfPorts = numberOfPortsOpenable(ns);
  let hackTarget = 'n00dles';
  const what = Math.ceil(Math.random() * 10);
  if (what > 5 && ns.getHackingLevel() > 4)
    hackTarget = 'sigma-cosmetics';
  ns.getServerNumPortsRequired(hackTarget);


  if (ns.getHackingLevel() > 2000 && noOfPorts == 5) {
    if (what > 7) hackTarget = 'taiyang-digital';
    else if (what > 3) hackTarget = 'clarkinc';
    else hackTarget = 'megacorp';
  }
  else if (ns.getHackingLevel() > 1500 && noOfPorts == 5) {
    if (what > 7) hackTarget = 'microdyne';    
    else if (what > 3) hackTarget = 'zb-institute';
    else hackTarget = 'titan-labs';
  }
  else if (ns.getHackingLevel() > 1500 && noOfPorts == 4) {
    if (what > 5) hackTarget = 'univ-energy';
    else hackTarget = 'global-pharm';
  }
  else if (ns.getHackingLevel() > 1000  && noOfPorts == 3) {
    if (what > 5) hackTarget = 'catalyst';    
    else hackTarget = 'millenium-fitness';
  }
  else if (ns.getHackingLevel() > 300 && noOfPorts == 2) {
    if (what > 7) hackTarget = 'phantasy';
    else if (what > 3) hackTarget = 'crush-fitness';
    else hackTarget = 'silver-helix';
  }
  else if (ns.getHackingLevel() > 200  && noOfPorts == 1) {
    if (what > 7) hackTarget = 'max-hardware';
    else if (what > 3) hackTarget = 'neo-net';
    else hackTarget = 'iron-gym';
  }
  else if (ns.getHackingLevel() > 100) {
    if (what > 7) hackTarget = 'joesguns';
    else if (what > 3) hackTarget = 'hong-fang-tea';
    else hackTarget = 'harakiri-sushi';
  }
  return hackTarget;
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
/**  @param {Date} time */
export function timeToS(time) {
  time /= 1000;
  return Math.round(time);
}