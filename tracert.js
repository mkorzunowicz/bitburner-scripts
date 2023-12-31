/** @param {NS} ns */
export async function main(ns) {
  const args = ns.flags([["help", false]]);
  const target = ns.args[0];
  if (args.help || !target) {
    ns.tprint("The script return the path to the requested target host.");
    ns.tprint(`Usage: run ${ns.getScriptName()} targetHostName`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} CSEC`);
    return;
  }

  let visited = [];

  // ns.tprint("Searching for: " + target);
  ns.disableLog("ALL");
  let path = await recursive_lookup(ns, 'home', visited, target);
  if (path instanceof (Array)) {
    ns.tprint(path.reverse());
    const command = 'connect '+ path.join(';connect ')
    navigator.clipboard.writeText(command);
    ns.tprint(command);
    // ns.tprint(path.reverse().join(' -> '));
  }
  else ns.tprint("Server not found! Check spelling.");
  
}

/** @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {Array<string>} visited Already visited servers
 * @param {string} target The server to find
*/
export async function recursive_lookup(ns, serv, visited, target) {
  let nextLevel = ns.scan(serv);

  visited.push(serv);

  for (let i = 0; i < nextLevel.length; ++i) {
    const serv2 = nextLevel[i];

    if (visited.includes(serv2))
      continue;

    // ns.tprint('on: ' + serv2);
    if (serv2 == target) {
      // ns.tprint('found');
      // ns.exec('backdoor');
      return [serv2];
    }

    // path.push(serv2);
    let p = await recursive_lookup(ns, serv2, visited, target);
    if (p instanceof (Array)) {
      p.push(serv2);
      return p;
    }
  }
}
