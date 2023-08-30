/** @param {NS} ns */
export async function main(ns) {
    const x = Number.parseInt(ns.args[0]);
    const y = Number.parseInt(ns.args[1]);
    await ns.stanek.chargeFragment(x,y);
  }