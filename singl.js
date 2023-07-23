const wnd = eval("window");
const doc = wnd["document"];
/** @param {NS} ns */
export async function main(ns) {
  // const resetInfo = ns.getResetInfo(); const lastAugReset = resetInfo.lastAugReset; ns.tprint(`The last augmentation reset was: ${new Date(lastAugReset)}`); ns.tprint(`It has been ${Date.now() - lastAugReset}ms since the last augmentation reset.`);

  ns.disableLog('ALL');
  const augsPerRun = 8;
  let force = ns.args[0];
  let shouldRun = true;
  // cancel this loop by pressing ESC
  function handleEscapeKey(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      shouldRun = false;
      doc.removeEventListener('keydown', handleEscapeKey);
    }
  }
  doc.addEventListener('keydown', handleEscapeKey);

  ns.atExit(() => {
    doc.removeEventListener('keydown', handleEscapeKey);
  });

  let prioFactions = [];
  let expandPid;
  let pl = ns.getPlayer();
  const startDate = new Date();
  // Augmentations will get installed in bulk of 10
  let runNumber = ns.singularity.getOwnedAugmentations().length / augsPerRun;

  // if (startScript(ns, "infi.js")) log(ns, "Infiltration automated.");
  // startScript(ns, "stats.js")
  if (startScript(ns, "backdoor_loop.js")) log(ns, "Backdooring...");
  if (startScript(ns, "homigrind_loop.js")) log(ns, "Grinding karma...");
  if (startScript(ns, "ultimate_spread.js", 'noexpand')) log(ns, "Spreading...");

  //  this shouldn't be really needed - this script must be executed at the very beginning after restart
  // if (force || pl.playtimeSinceLastAug < 100000 || pl.money < 100000000 || !ns.hasTorRouter()) {
  if (force || !ns.hasTorRouter()) {
    // One infiltration run of MegaCorp to gain some init money before we can travel to Aevum for ECorp grinding
    if (ns.getPlayer().money < 300000000) {
      if (ns.singularity.travelToCity('Aevum'))
        await infiltrate(ns, 'ECorp', 1, 'none');
      else
        await infiltrate(ns, 'MegaCorp', 1, 'none');
      log(ns, 'Running pre intro infiltration', 'info', 70000);
    }


    if (ns.singularity.joinFaction('Shadows of Anarchy'))
      log(ns, `Joined: ${'Shadows of Anarchy'}`, 'warning');
    buyApps(ns);
    expandServers(ns);
    // split to allow different Factions to pop up
    if (runNumber < 2) {
      log(ns, 'Running American intro infiltrations', 'info', 80000 * 3);
      prioFactions = ['Sector-12', 'Aevum']
      await infiltrate(ns, 'ECorp', 3, 'none');
    }
    if (runNumber < 7 && runNumber >= 2) {
      log(ns, 'Running Asian intro infiltrations', 'info', 80000 * 3);
      prioFactions = ['Chongqing', 'Ishima', 'New Tokyo']
      await infiltrate(ns, 'KuaiGong International', 1, 'none');
      await infiltrate(ns, 'VitaLife', 1, 'none');
      await infiltrate(ns, 'Storm Technologies', 1, 'none');
    }
    if (runNumber < 12 && runNumber >= 7) {
      log(ns, 'Running European intro infiltrations', 'info', 80000 * 2);
      prioFactions = ['Volhaven']
      await infiltrate(ns, 'OmniTek Incorporated', 2, 'none');
    }
    if (runNumber == 0) {
      ns.singularity.purchaseAugmentation('Shadows of Anarchy', 'SoA - phyzical WKS harmonizer');

      Array.from({ length: 6 }, () => ns.singularity.upgradeHomeRam());
      Array.from({ length: 6 }, () => ns.singularity.upgradeHomeCores());
    }
  }
  if (runNumber < 2) {
    prioFactions = ['Sector-12', 'Aevum'];
  }
  else if (runNumber < 7 && runNumber >= 2) {
    prioFactions = ['Chongqing', 'Ishima', 'New Tokyo'];
  }
  else if (runNumber < 12 && runNumber >= 7) {
    prioFactions = ['Volhaven'];
  }
  if (runNumber < 5 && runNumber >= 3)
    prioFactions.push('The Black Hand', 'CyberSec', 'NiteSec');

  if (runNumber < 8) {
    // if (ns.getPlayer().skills.hacking<5000) {
    if (ns.isRunning("upgrade_servers.js")) {
      ns.kill("upgrade_servers.js");
      log(ns, 'Money grinding is slow.. stopping upgrades', 'warning');
    }
  }
  while (ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length < augsPerRun && shouldRun) {
    // while ((pl.factions.includes('Daedalus') && !ns.singularity.getOwnedAugmentations(true).includes('The Red Pill')) || ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length < 8 && shouldRun) {
    // so we grind until we install 8 new augmentations.. backdoor on world deamon gets installed automatically in backdoor_loop.js

    startScript(ns, "backdoor_loop.js");
    let invites = ns.singularity.checkFactionInvitations();
    for (const factionname of invites) {
      if (runNumber > 2 && ['Sector-12', 'Aevum'].includes(factionname)) continue; // TODO: fix this based on prioFactions?

      if (ns.singularity.joinFaction(factionname))
        log(ns, `Joined: ${factionname}`, 'warning');
    }
    
    let hackingOnly = false;
    // let hackingOnly = true;
    // if (ns.singularity.getOwnedAugmentations().length >= 22) // suboptimal, but close
    // hackingOnly = false;
    let best = findAugmentationToBuy(ns, null, hackingOnly, true, prioFactions);
    if (!best) {
      // we might need to grind for Daedalus
      if (!ns.singularity.getOwnedAugmentations(true).includes('The Red Pill')) {
        if (pl.skills.hacking > 2500 && ns.singularity.getOwnedAugmentations().length > 30 && pl.money < 100000000000 && !pl.factions.includes('Daedalus')) {
          if (ns.isRunning("upgrade_servers.js")) {
            ns.kill("upgrade_servers.js");
            log(ns, 'Killing upgrades to allow Daedalus to pop up');
          }
        }
      }
      else {
        if (!ns.isRunning("upgrade_servers.js")) {
          expandPid = ns.exec("expand_servers.js", 'home', 1, 'noprompt');
          if (expandPid != 0)
            log(ns, "Started server expand loop");
          else
            log(ns, "ERROR Couldn't start expand loop!!!");
        }
      }
      // console.log('Grinding money not to sit around idle!!!!');
      // await infiltrate(ns, 'ECorp', 1, 'none'); // let's not idle
      await ns.sleep(1000);
      pl = ns.getPlayer();
      continue;
    }
    // let's stop the server expansion for now cause we want to save money for augments
    // if (expandPid && ns.isRunning(expandPid)) {
    //   ns.kill(expandPid);
    // }

    await grindRep(ns, best);
    if (!shouldRun) break;
    await grindMoney(ns, best);
    if (!shouldRun) break;
    buyAugmentation(ns, best);

    await ns.sleep(1000);
    pl = ns.getPlayer();
  }

  for (const factionname of ns.singularity.checkFactionInvitations()) {
    if (ns.singularity.joinFaction(factionname))
      log(ns, `Joined: ${factionname}`, 'warning');
  }

  let leftoverAugmentation;
  while ((leftoverAugmentation = findAugmentationToBuy(ns, pl.money, false, false, prioFactions)) && shouldRun) {
    // if we still have money to buy any hack augmentations.. but can grind rep
    await grindRep(ns, leftoverAugmentation);
    buyAugmentation(ns, leftoverAugmentation);

    await ns.sleep(1000);
    pl = ns.getPlayer();
  }
  if (!shouldRun) {
    log(ns, 'Escape key pressed. Cancelling singl.js', 'error');
    return;
  }

  while (ns.singularity.upgradeHomeRam())
    log(ns, 'upgraded ram on exit');

  while (ns.singularity.upgradeHomeCores())
    log(ns, 'upgraded cores on exit');

  log(ns, `AUGMENTS INSTALLED at ${new Date().toTimeString()}. Run took: ${timeTakenInSeconds(startDate, new Date())}s. Since last AUG: ${new Date(ns.getTimeSinceLastAug())}`, 'success', 60000);
  ns.singularity.installAugmentations('starter.js');
}

/** @param {NS} ns */
function infiltrationInfo(ns) {
  let infiInfo = {}
  let infiLocations = ns.infiltration.getPossibleLocations();

  for (const loc in infiLocations) {
    let l = infiLocations[loc];
    infiInfo[l.name] = ns.infiltration.getInfiltration(l.name);
  }
  return infiInfo;
}

function bestInfi(infiInfo) {
  let bestCompany = null;
  let highestTradeRepValue = -Infinity;

  for (const key in infiInfo) {
    const company = infiInfo[key];
    if (company.reward.tradeRep > highestTradeRepValue) {
      highestTradeRepValue = company.reward.tradeRep;
      bestCompany = company;
    }
  }
  return bestCompany;
}

/** @param {NS} ns */
function buyAugmentation(ns, aug) {
  if (ns.singularity.purchaseAugmentation(aug.faction, aug.aug))
    log(ns, `Augmentation ${aug.aug} in ${aug.faction} bought for ${ns.nFormat(aug.price, "0.0a")}`, 'success', 30000);
  else
    log(ns, `Couldn't buy augmentation: ${aug.aug} in ${aug.faction}`, 'warning');
}

let repGainPer100k;
/** @param {NS} ns */
async function repPer100k(ns, faction) {
  if (repGainPer100k) return repGainPer100k;

  while (ns.getPlayer().money < 100000)
    await ns.sleep(200);
  let fRepBefore = ns.singularity.getFactionRep(faction);
  ns.singularity.donateToFaction(faction, 100000);
  let fRepAfter = ns.singularity.getFactionRep(faction);
  repGainPer100k = fRepAfter - fRepBefore;
  return repGainPer100k;
}
/** @param {NS} ns */
async function grindRep(ns, aug) {
  let factionRep = ns.singularity.getFactionRep(aug.faction);
  if (aug.repreq > factionRep) {
    const facFavor = ns.singularity.getFactionFavor(aug.faction);
    if (facFavor >= ns.getFavorToDonate() && ns.getPlayer().skills.hacking > 6000) {

      let required = aug.repreq - factionRep;
      const repGain = await repPer100k(ns, aug.faction);

      let moneyToBuyRep = required / repGain * 100000;
      if (ns.getPlayer().money < moneyToBuyRep)
        log(ns, `Waiting for money to donate to ${aug.faction} to buy ${required} rep`, 'warning');
      while (ns.getPlayer().money < moneyToBuyRep)
        await ns.sleep(200);

      if (ns.singularity.donateToFaction(aug.faction, moneyToBuyRep)) {

        log(ns, `Donated: ${ns.nFormat(moneyToBuyRep, "$0.0a")} to ${aug.faction} to buy ${required} rep`, 'warning');
        return;
      }
    }

    // figure out the number of times and/or target  we need to run the faction grind
    const grindTarget = infiToGrind(ns, null, aug.repreq - factionRep);
    await grindInfiltration(ns, aug, grindTarget.company, grindTarget.times, aug.faction);
  }
}

/** @param {NS} ns */
async function grindMoney(ns, aug) {
  if (ns.getPlayer().skills.hacking > 5000) {
    log(ns, "Skipping infiltration to grind money since it should be fast enough to just wait");
    while (ns.getPlayer().money < aug.price)
      await ns.sleep(200);
  }
  else {
    let pl = ns.getPlayer();
    if (aug.price > pl.money) {
      let grindTarget = infiToGrind(ns, aug.price - pl.money);
      await grindInfiltration(ns, aug, grindTarget.company, grindTarget.times, 'none');
    }
  }
}
/** @param {NS} ns */
async function grindInfiltration(ns, aug, company, times, faction) {
  log(ns, `Grinding ${faction == 'none' ? 'money' : 'rep'} on: ${company} ${times} times to buy ${aug.aug} in ${aug.faction}`, 'info', 80000 * times);
  await infiltrate(ns, company, times, faction);
}

function infiToGrind(ns, requestedMoney, requestedReputation) {
  const cpn = bestInfi(infiltrationInfo(ns));
  let timesToWork;
  if (requestedMoney)
    timesToWork = Math.ceil(requestedMoney / cpn.reward.sellCash);
  else
    timesToWork = Math.ceil(requestedReputation / cpn.reward.tradeRep);
  return { company: cpn.location.name, times: timesToWork };
}

/** @param {NS} ns */
function findAugmentationToBuy(ns, moneyAvailable = null, hackingOnly = true, noShadows = true, prioritizeFactions = []) {
  let pl = ns.getPlayer();
  const owned = ns.singularity.getOwnedAugmentations(true);
  const notInstalled = owned.length - ns.singularity.getOwnedAugmentations(false).length;
  const augDict = {}
  const factionrep = Object.fromEntries(ns.getPlayer().factions.map(f => [f, ns.singularity.getFactionRep(f)]));
  for (const f of pl.factions) {
    augDict[f] = {}
    let augs = ns.singularity.getAugmentationsFromFaction(f);
    for (const aug of augs) {
      if (hackingOnly && aug == 'NeuroFlux Governor') continue;
      if (noShadows && f == 'Shadows of Anarchy') continue;
      if (aug != 'NeuroFlux Governor' && owned.includes(aug)) continue;
      augDict[f][aug] = {}

      augDict[f][aug].multis = ns.singularity.getAugmentationStats(aug);
      augDict[f][aug].price = ns.singularity.getAugmentationPrice(aug);
      augDict[f][aug].prereq = ns.singularity.getAugmentationPrereq(aug);
      augDict[f][aug].repreq = ns.singularity.getAugmentationRepReq(aug);
      augDict[f][aug].facrep = factionrep[f];
    }
  }
  // debugger;

  const highestInfi = bestInfi(infiltrationInfo(ns));
  // debugger;
  const filteredEntries = [];
  for (const faction in augDict) {
    for (const aug in augDict[faction]) {
      const entry = augDict[faction][aug];
      const { hacking_chance, hacking_speed, hacking_money, hacking_grow, hacking, hacking_exp } = entry.multis;
      // if moneyAvailable provided lets limit only to the ones buyable and where rep is high enough
      if (moneyAvailable && (moneyAvailable < entry.price)) continue;
      // if (moneyAvailable && (moneyAvailable < entry.price || ns.singularity.getFactionRep(faction) < entry.repreq)) continue;
      if (!entry.prereq.every(e => owned.includes(e))) continue; // we want to own all the prereqs
      const isHacking = hacking_chance > 1 || hacking_speed > 1 || hacking_money > 1 || hacking_grow > 1 || hacking > 1 || hacking_exp > 1;
      if (hackingOnly && !isHacking) continue;
      if (faction == 'Bladeburners' && entry.repreq > factionrep[faction]) continue; // Bladeburners can't grind rep through Infiltration
      filteredEntries.push({
        faction,
        aug,
        price: entry.price,
        repreq: entry.repreq,
        multis: entry.multis,
        facrep: entry.facrep,
        isHacking: isHacking,
        repRuns: entry.repreq <= entry.facrep ? 0 : Math.ceil((entry.repreq - entry.facrep) / highestInfi.reward.tradeRep),
        moneyRuns: pl.money >= entry.price ? 0 : Math.ceil((entry.price - pl.money) / highestInfi.reward.sellCash),
        isNeuroFlux: aug === 'NeuroFlux Governor',
        isPrio: prioritizeFactions.includes(faction)
      });

    }
  }
  // debugger;
  const moneyRunsLimit = 30; // if we already have augmentations installed and they are crazy expensive.. put them at the bottom of the list
  const sortedEntries = filteredEntries.sort((a, b) => {
    if (a.aug === 'Neuroreceptor Management Implant' && b.aug !== 'Neuroreceptor Management Implant') return -1; // not focused bonus from Tian Di Hui
    if (a.aug !== 'Neuroreceptor Management Implant' && b.aug === 'Neuroreceptor Management Implant') return 1; // not focused bonus from Tian Di Hui

    if (notInstalled > 0 && a.moneyRuns > moneyRunsLimit && b.moneyRuns <= moneyRunsLimit) return 1;
    else if (notInstalled > 0 && a.moneyRuns <= moneyRunsLimit && b.moneyRuns > moneyRunsLimit) return -1;

    if (a.isNeuroFlux && !b.isNeuroFlux) return 1;
    else if (!a.isNeuroFlux && b.isNeuroFlux) return -1;

    if (a.isPrio && !b.isPrio) return -1;
    else if (!a.isPrio && b.isPrio) return 1;

    if (a.isHacking && !b.isHacking) return -1;
    else if (!a.isHacking && b.isHacking) return 1;

    // if (a.price !== b.price) return b.price - a.price; // Sort by price in descending order
    if (a.price !== b.price) return a.price - b.price; // Sort by price in ascending order
    else if (a.facrep !== b.facrep) return b.facrep - a.facrep; // Sort by facrep in descending order
    else return 0;
  });

  return sortedEntries[0];
}

/** @param {NS} ns */
function expandServers(ns) {
  if (!ns.isRunning("expand_servers.js", 'home', 'noprompt') || !ns.isRunning("upgrade_servers.js", 'home'))
    if (startScript(ns, "expand_servers.js", 'noprompt')) ns.tprint("Started server expand loop");
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

function stopScript(ns, scriptName, param) {
  if (!ns.isRunning(scriptName, 'home', 'noprompt')) {
    expandPid = ns.exec(scriptName, 'home', 1, 'noprompt');
    if (expandPid != 0)
      ns.tprint("Started server expand loop");
    else
      ns.tprint("ERROR Couldn't start expand loop!!!");
  }
}

/** @param {NS} ns */
function buyApps(ns) {
  if (ns.singularity.purchaseTor()) {
    ns.singularity.purchaseProgram('BruteSSH.exe');
    ns.singularity.purchaseProgram('FTPCrack.exe');
    ns.singularity.purchaseProgram('relaySMTP.exe');
    ns.singularity.purchaseProgram('HTTPWorm.exe');
    ns.singularity.purchaseProgram('SQLInject.exe');

    log(ns, "Tor and hack programs purchased", 'success');
  }
}

/** @param {NS} ns */
async function infiltrate(ns, target, times, faction) {
  if (ns.getPlayer().hp.current < ns.getPlayer().hp.max)
    ns.singularity.hospitalize();
  const infiPid = ns.exec("infi_loop.js", 'home', 1, target, times, faction, 'dontGrind');
  if (infiPid != 0)
    log(ns, `${target} for ${times} times infiltration started...`);
  else
    log(ns, " Couldn't start infiltration of " + target + " !!!", 'error');

  while (ns.isRunning(infiPid)) {
    await ns.sleep(2000);
  }
}

function timeTakenInSeconds(startDate, endDate) {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const timeDifferenceInMilliseconds = endTime - startTime;
  const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);

  return timeDifferenceInSeconds;
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