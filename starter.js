import { log, startScript, hasSingularity } from 'common.js'

/** This code starts one infiltration if we don't have enough ram to run singl.js
 * then checks if singularity is there and starts the code.
 * @param {NS} ns */
export async function main(ns) {
  if (startScript(ns, "infi.js")) log(ns, "Infiltration automated.");
  if (ns.getServerMaxRam('home') <= 256 && ns.getPlayer().money < 300000000) {
    await infiltrate(ns, 'MegaCorp', 1, 'none');
  }

  startScript(ns, "stats.js")

  if (hasSingularity(ns)) {
    if (ns.getServerMaxRam('home') <= 256)
      Array.from({ length: 3 }, () => ns.singularity.upgradeHomeRam());
    if (startScript(ns, "singl.js")) log(ns, "Starting singularity automation...");
  }
  else {
    if (startScript(ns, "ultimate_spread.js")) log(ns, "Spreading...");
  }
}
/** @param {NS} ns */
async function infiltrate(ns, target, times, faction) {
  // if (ns.getPlayer().hp.current < ns.getPlayer().hp.max)
  //   ns.singularity.hospitalize();
  const infiPid = ns.exec("infi_loop.js", 'home', 1, target, times, faction, 'dontGrind');
  if (infiPid != 0)
    log(ns, `${target} for ${times} times infiltration started...`);
  else
    log(ns, " Couldn't start infiltration of " + target + " !!!", 'error');

  while (ns.isRunning(infiPid)) {
    await ns.sleep(2000);
  }
}
