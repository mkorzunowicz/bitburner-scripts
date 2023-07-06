/** @param {NS} ns */
export async function main(ns) {
  const args = ns.flags([["help", false]]);
  const server = ns.args[0];
  if (args.help || !server) {

    const servers = ns.getPurchasedServers();
    servers.forEach((server) => {
      ns.killall(server);
      // await ns.sleep(2000);
      share_rep(ns, server);
    });
  }
  else if (server == 'all') {
    everywhere(ns);
  }
  else
    share_rep(ns, server);

  const power = ns.getSharePower();
  ns.tprint("Cumulative sharing power: " + power);
}
/** @param {NS} ns */
export async function share_rep(ns, server) {
  const scriptName = 'share.js';
  ns.scp(scriptName, server);
  const scriptRam = ns.getScriptRam(scriptName, server);
  const availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

  // ns.tprint("Script " + scriptRam + ". Available: " + availableRam);
  const threads = Math.floor(availableRam / scriptRam);

  // ns.tprint("Threads on " + server + ": " + threads);
  if (threads > 0) {
    let scpid = ns.exec(scriptName, server, threads);
    if (scpid != 0)
      ns.tprint("Sharing rep gains on " + server + " on in " + threads + " threads." + "PID: " + scpid);
  }
}

/** @param {NS} ns */
export async function everywhere(ns) {
  let visited = [];
  // ns.killall('home');
  // share_rep(ns, 'home');
  await recursive_scan(ns, 'home', visited);
}

/** @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {Array<string>} visited Already visited servers
*/
export async function recursive_scan(ns, serv, visited) {
  let nextLevel = ns.scan(serv);
  visited.push(serv);

  ns.tprint("Killing " + serv);
  // ns.killall(serv);  
  // await ns.sleep(2000);
  share_rep(ns, serv);

  for (let i = 0; i < nextLevel.length; ++i) {
    const serv2 = nextLevel[i];

    if (visited.includes(serv2))
      continue;

    await recursive_scan(ns, serv2, visited)
  }
}

