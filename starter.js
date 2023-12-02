import { log, startScript, hasSingularity } from 'common.js'
import { getConfiguration } from 'helpers.js'

const argsSchema = [
  ['noUpgrades', false], // Don't upgrade the servers - both pservers and hacknet
  ['dontKillWorldDaemon', false], // Don't kill the World Deamon
  ['runOnPServer', false], //for BN1 challenge

];
export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}
let runOptions;

/** This code starts one infiltration if we don't have enough ram to run singl.js
 * then checks if singularity is there and starts the code.
 * @param {NS} ns */
export async function main(ns) {

  runOptions = getConfiguration(ns, argsSchema);
  if (!runOptions) return; // Invalid options, or ran in --help mode.

  if (startScript(ns, "infi.js", false, ['--quiet'])) log(ns, "Infiltration automated.");
  if (ns.getServerMaxRam('home') <= 128 && ns.getPlayer().money < 300000000) {
    await infiltrate(ns, 'MegaCorp', 1, 'none');
  }
  let runOn = 'home';
  if (runOptions.runOnPServer) {
    runOn = "pserv-0";
    ns.purchaseServer("pserv-0", 512);
    ns.scp(['singl.js', 'helpers.js', 'common.js', 'stockmaster.js', 'background_work.js', 'lstanek.js', 'stanek.js', 'sleeve.js', 'ultimate_spread.js'], runOn, 'home');
  
    ns.killall(runOn);
  }

  startScript(ns, "stats.js")
  // startScript(ns, "stats.js", false, null, runOn)

  if (hasSingularity(ns)) {
    if (!runOptions.runOnPServer)
    while (ns.getServerMaxRam('home') <= 512 && ns.singularity.upgradeHomeRam())
      continue;


    let params = [];
    if (ns.getResetInfo().currentNode == 8) params.push('--noUpgrades');
    else
      if (runOptions.noUpgrades) params.push('--noUpgrades');
    if (runOptions.dontKillWorldDaemon) params.push('--dontKillWorldDaemon');
    if (startScript(ns, "singl.js", true, params, runOn)) log(ns, "Starting singularity automation...");
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
