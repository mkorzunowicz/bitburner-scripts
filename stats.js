import { numberOfPortsOpenable, formatDuration, timeTakenInSeconds, totalRam } from 'common'

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
    hook1.innerText = `${Math.ceil(ns.getBitNodeMultipliers().WorldDaemonDifficulty * 3000)}`;

    const resetInfo = ns.getResetInfo();
    hook0.innerText += `\nBN${resetInfo.currentNode} time`;

    hook1.innerText += `\n${formatDuration(timeTakenInSeconds(new Date(resetInfo.lastNodeReset), new Date()))}`;

    hook0.innerText += "\nAug inst";
    hook1.innerText += `\n${formatDuration(ns.getTimeSinceLastAug() / 1000)}`;

    hook0.innerText += "\nAugs";
    hook1.innerText += `\n${ns.singularity.getOwnedAugmentations().length} (${ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length})`;

    // hook0.innerText += "\nIncome"
    // hook1.innerText += `\n${ns.nFormat(ns.getScriptIncome('ultimate_spread.js', 'home', 'noexpand'), "$0.0a")}/s`;

    hook0.innerText += "\nIncome"
    hook1.innerText += `\n${ns.nFormat(ns.getTotalScriptIncome()[0], "$0.0a")}/s`;

    hook0.innerText += "\nExp"
    // hook1.innerText += `\n${ns.nFormat(ns.getScriptExpGain('ultimate_spread.js', 'home', 'noexpand'), "0.0a")}/s`;
    hook1.innerText += `\n${ns.nFormat(ns.getTotalScriptExpGain(), "0.0a")}/s`;

    hook0.innerText += "\nKarma"
    hook1.innerText += `\n${ns.nFormat(ns.heart.break(), "0.0a")}`;

    hook0.innerText += "\nPpl killed";
    hook1.innerText += `\n${ns.getPlayer().numPeopleKilled}`;

    hook0.innerText += "\nUpgrading";
    if (ns.isRunning('upgrade_servers.js'))
      hook1.innerText += "\nYES";
    else
      hook1.innerText += "\nNO";

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

    hook0.innerText += "\nHome ram";
    hook1.innerText += `\n${ns.formatRam(ns.getServerMaxRam('home'))}`;

    hook0.innerText += "\nTotal ram";
    hook1.innerText += `\n${ns.formatRam(totalRam(ns))}`;
    

    await ns.sleep(1000);
  }
}
