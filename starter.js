/** @param {NS} ns */
export async function main(ns) {
    if (startScript(ns, "infi.js")) log(ns, "Infiltration automated.");
    if (ns.getServerMaxRam('home') <= 32 && ns.getPlayer().money < 300000000) {
      await infiltrate(ns, 'MegaCorp', 1, 'none');
    }
  
    startScript(ns, "stats.js")
  
    if (hasSingularity(ns)) {
      if (ns.getServerMaxRam('home') <= 32)
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
  
  function startScript(ns, scriptName, param) {
    if (param) {
      if (!ns.isRunning(scriptName, 'home', param)) {
        if (ns.exec(scriptName, 'home', 1, param) != 0)
          return true;
      }
      else return true;
    }
    else if (!ns.isRunning(scriptName, 'home')) {
      if (ns.exec(scriptName, 'home', 1) != 0)
        return true;
  
      log(ns, `Couldn't start ${scriptName}!!!`, 'error');
      return false;
    }
    else return true;
  }
  /** @param {NS} ns */
  function hasSingularity(ns) {
    try {
      ns.singularity.connect('home');
      return true;
    }
    catch {
      return false;
    }
  }
  /** @param {NS} ns */
  function log(ns, msg, type = 'info', time = 15000) {
    console.log(msg);
    ns.toast(msg, type, time);
    if (type == 'info' || type == 'success') {
      ns.print(msg);
      ns.tprint(msg);
    }
    else {
      ns.print(type.toUpperCase() + ": " + msg);
      ns.tprint(type.toUpperCase() + ": " + msg);
    }
  }