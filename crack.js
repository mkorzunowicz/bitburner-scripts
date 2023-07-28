// early game hacks
/** @param {NS} ns */
export async function main(ns) {
  const args = ns.flags([["help", false]]);
  const executingServer = ns.args[0];
  if (args.help || !executingServer) {
    ns.tprint("The script will try to hack an adequate server to the player level on the given executing server.");
    ns.tprint(`Usage: run ${ns.getScriptName()} executingServer`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} CSEC`);
    return;
  }

  const scriptName = "weaken_grow_hack.js";
  ns.scp(scriptName, executingServer);

  const scriptRam = ns.getScriptRam(scriptName, executingServer);
  const availableRam = ns.getServerMaxRam(executingServer) - ns.getServerUsedRam(executingServer);

  const threads = Math.floor(availableRam / scriptRam);
  if (threads > 0) {

    let hackTarget = 'n00dles';
    const what = Math.ceil(Math.random() * 10);
    if (what > 5 && ns.getHackingLevel() > 4)
      hackTarget = 'sigma-cosmetics';

    if (threads > 100000 && ns.getHackingLevel() > 2000 && ns.fileExists('SQLInject.exe')) {
      if (what > 7) hackTarget = 'taiyang-digital';
      else if (what > 3) hackTarget = 'clarkinc';
      else hackTarget = 'megacorp';
    }
    else if (threads > 50000 && ns.getHackingLevel() > 1500 && ns.fileExists('SQLInject.exe')) {
      if (what > 7) hackTarget = 'titan-labs';
      else if (what > 3) hackTarget = 'univ-energy';
      else hackTarget = 'global-pharm';
    }
    else if (threads > 10000 && ns.getHackingLevel() > 1000 && ns.fileExists('HTTPWorm.exe')) {
      if (what > 7) hackTarget = 'microdyne';
      else if (what > 3) hackTarget = 'zb-institute';
      else hackTarget = 'millenium-fitness';
    }
    else if (threads > 1000 && ns.getHackingLevel() > 300 && ns.fileExists('relaySMTP.exe')) {
      if (what > 7) hackTarget = 'phantasy';
      else if (what > 3) hackTarget = 'crush-fitness';
      else hackTarget = 'silver-helix';
    }
    else if (threads > 300 && ns.getHackingLevel() > 200 && ns.fileExists('FTPCrack.exe')) {
      if (what > 7) hackTarget = 'max-hardware';
      else if (what > 3) hackTarget = 'neo-net';
      else hackTarget = 'iron-gym';
    }
    else if (threads > 50 && ns.getHackingLevel() > 100 && ns.fileExists('BruteSSH.exe')) {
      if (what > 7) hackTarget = 'joesguns';
      else if (what > 3) hackTarget = 'hong-fang-tea';
      else hackTarget = 'harakiri-sushi';
    }

    const crackedTarget = await crackPorts(ns, hackTarget);
    const crackedExec = await crackPorts(ns, executingServer);
    if (!crackedExec || !crackedTarget) return;

    // ns.tprint("Exec " + crackedExec + " Target " + crackedTarget);
    let scpid = ns.exec(scriptName, executingServer, threads, hackTarget);
    if (scpid != 0)
      ns.tprint("Hacking " + hackTarget + " on " + executingServer + " in " + threads + " threads." + "PID: " + scpid);
  }
}

/** @param {NS} ns
 *  @param {String} serverName
*/
export async function crackPorts(ns, serverName) {

  try {
    if (ns.fileExists('BruteSSH.exe'))
      ns.brutessh(serverName);
    if (ns.fileExists('FTPCrack.exe'))
      ns.ftpcrack(serverName);
    if (ns.fileExists('relaySMTP.exe'))
      ns.relaysmtp(serverName);
    if (ns.fileExists('HTTPWorm.exe'))
      ns.httpworm(serverName);
    if (ns.fileExists('SQLInject.exe'))
      ns.sqlinject(serverName);
    ns.nuke(serverName);
    return true;
  }
  catch {
    // most probably ports not open
    return false;
  }
}

