import { numberOfPortsOpenable } from 'common.js'

/**
 * @param {NS} ns
 **/
export async function main(ns) {
  ns.disableLog('ALL');
  const doc = eval('document')
  const hook0 = doc.getElementById('overview-extra-hook-0')
  const hook1 = doc.getElementById('overview-extra-hook-1')
  if (!hook0 || !hook1) {
    return
  }

  ns.atExit(() => {
    hook0.innerText = ""
    hook1.innerText = ""
  });
  while (true) {
    let hasTor = ns.hasTorRouter();

    hook0.innerText = "w0r1d_d43m0n";
    hook1.innerText = `${ns.getBitNodeMultipliers().WorldDaemonDifficulty * 3000}`;

    hook0.innerText += "\nIncome\nExper.\nKarma"
    hook1.innerText +=
      `\n${ns.nFormat(ns.getScriptIncome('ultimate_spread.js', 'home', 'noexpand'), "$0.0a")}/s` +
      // `${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")}/s` +
      `\n${ns.nFormat(ns.getScriptExpGain('ultimate_spread.js', 'home', 'noexpand'), "0.0a")}/s` +
      `\n${ns.nFormat(ns.heart.break(), "0.0a")}`

    hook0.innerText += "\nPpl killed";
    hook1.innerText += `\n${ns.getPlayer().numPeopleKilled}`;

    hook0.innerText += "\nUpgrading";
    if (ns.isRunning('upgrade_servers.js'))
      hook1.innerText += "\nYES";
    else
      hook1.innerText += "\nNO";

    hook0.innerText += "\nAugs";
    hook1.innerText += `\n${ns.singularity.getOwnedAugmentations().length} (${ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length})`;

    if (!hasTor) {
      hook0.innerText += "\nTor";
      hook1.innerText += "\nNO";
    }
    if (numberOfPortsOpenable(ns) < 5) {
      hook0.innerText += "\nPorts";
      hook1.innerText += `\n${numberOfPortsOpenable(ns)}`;
    }

    hook0.innerText += "\nSingl running";
    if (ns.isRunning('singl.js'))
      hook1.innerText += "\nYES";
    else
      hook1.innerText += "\nNO";

    hook0.innerText += "\nInfi runs";
    hook1.innerText += `\n${localStorage.getItem('infiRunCounter')}`;

    await ns.sleep(1000);
  }
}
