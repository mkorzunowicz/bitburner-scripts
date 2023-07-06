/** @param {NS} ns */
export async function main(ns) {
  let visited = [];

  // ns.tprint("Searching for: " + target);
  ns.disableLog("ALL");
  let path = await recursive_lookup(ns, 'home', visited);
  // if (path instanceof (Array)) {
  //   ns.tprint(path.reverse());
  //   // ns.tprint(path.reverse().join(' -> '));
  // }
  // else ns.tprint("Server not found! Check spelling.");

}

/** @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {Array<string>} visited Already visited servers
 * @param {string} target The server to find
*/
export async function recursive_lookup(ns, serv, visited) {
  let nextLevel = ns.scan(serv);

  var ccts = ns.ls(serv, '.cct');
  if (ccts.length > 0)
    ns.tprint(serv + ": " + ccts);
  visited.push(serv);

  for (let i = 0; i < nextLevel.length; ++i) {
    const serv2 = nextLevel[i];

    if (visited.includes(serv2))
      continue;

    // ns.tprint('on: ' + serv2);
    // if (serv2 == target) {
    //   // ns.tprint('found');
    //   // ns.exec('backdoor');
    //   return [serv2];
    // }

    // path.push(serv2);
    let p = await recursive_lookup(ns, serv2, visited);
    // if (p instanceof (Array)) {
    //   p.push(serv2);
    //   return p;
    // }
  }
}
