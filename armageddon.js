let visited = [];
/** @param {NS} ns */
export async function main(ns) {
  visited = [];
  let level1 = ns.scan('home');

  ns.killall('home');
  await ns.sleep(200);
  for (let i = 0; i < level1.length; ++i) {
    const serv = level1[i];
    // store visited to skip it and not get stuck in a loop
    visited.push(serv);
    await recursive_scan(ns, serv);
  }
}

/** @param {NS} ns */
export async function recursive_scan(ns, serv) {
  let nextLevel = ns.scan(serv);

  for (let i = 0; i < nextLevel.length; ++i) {
    const serv2 = nextLevel[i];

    if (visited.includes(serv2))
      continue;
    visited.push(serv2);

    ns.tprint("Killing all on " + serv2);
    ns.killall(serv2);
    await recursive_scan(ns, serv2)
  }
}