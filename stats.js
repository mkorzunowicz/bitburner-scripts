
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
  while (true) {
    let hasTor = ns.hasTorRouter();

    hook0.innerText = "Income\nExper.\nKarma"
    hook1.innerText =
      `${ns.nFormat(ns.getScriptIncome('ultimate_spread.js', 'home', 'noexpand'), "$0.0a")}/s` +
      // `${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")}/s` +
      `\n${ns.nFormat(ns.getScriptExpGain('ultimate_spread.js', 'home', 'noexpand'), "0.0a")}/s` +
      `\n${ns.nFormat(ns.heart.break(), "0.0a")}`

    if (!hasTor) {
      hook0.innerText += "\nTor";
      hook1.innerText += "\nNO";
    }


    hook0.innerText += "\nUpgrading";
    if (ns.isRunning('upgrade_servers.js'))
      hook1.innerText += "\nYES";
    else
      hook1.innerText += "\nNO";
      
      hook0.innerText += "\nAugs";
      hook1.innerText += `\n${ns.singularity.getOwnedAugmentations().length} (${ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length})`;
    
    await ns.sleep(1000);
  }
}
