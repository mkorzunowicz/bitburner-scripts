/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
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
  let myLevel = ns.getHackingLevel();
  let servLevel = ns.getServerRequiredHackingLevel(serv);
  
  const availableRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
  if (availableRam < 5) return;
  if (servLevel <= myLevel || serv == 'home') {
    // ns.tprint("Spreading to: " + serv);
    ns.print("Spreading to: " + serv);
    // await ns.sleep(1000);
    // ns.exec('run_better_hacking.js', 'home', 1, serv);
    ns.exec('crack.js', 'home', 1, serv);
  }
  else {
    // ns.tprint("Didn't spread to: " + serv + ". My level:" + myLevel + " Req: " + servLevel);
  }
}
