/** @param {NS} ns */
export async function main(ns) {
  // ns.disableLog("ALL");
  ns.killall('home');
  // if (!ns.isRunning("expand_servers.js")) {
  const expandPid = ns.exec("expand_servers.js", 'home');
  if (expandPid != 0)
    ns.tprint("Started server expand loop");
  // }
  // run forever, go through servers accessible from home
  while (true) {
    let visited = [];

    await run_hack(ns, 'home');
    await recursive_scan(ns, 'home', visited);
    await ns.sleep(2000);
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

    await run_hack(ns, serv2);
    await recursive_scan(ns, serv2, visited)
  }
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
    copyScripts(ns, [scriptName, 'hack.js', 'grow.js', 'weaken.js'], serv);
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