const wnd = eval("window");
const doc = wnd["document"];
/** @param {NS} ns */
export async function main(ns) {
  let force = ns.args[0];

  let shouldRun = true;

  // cancel this loop by pressing ESC
  function handleEscapeKey(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      shouldRun = false;
      doc.removeEventListener('keydown', handleEscapeKey);
      console.log('Escape key pressed. Cancelling singl.js');
      ns.tprint('Escape key pressed. Cancelling singl.js');
    }
  }
  doc.addEventListener('keydown', handleEscapeKey);

  ns.atExit(() => {
    doc.removeEventListener('keydown', handleEscapeKey);
  });

  let expandPid;
  let pl = ns.getPlayer();
  const startDate = new Date();
  // Augmentations will get installed in bulk of 10
  let runNumber = ns.singularity.getOwnedAugmentations().length / 10;

  if (startScript(ns, "infi.js")) ns.tprint("Infiltration automated.");
  if (startScript(ns, "stats.js")) ns.tprint("Stats overview enchanced.");
  if (startScript(ns, "backdoor_loop.js")) ns.tprint("Backdooring...");
  if (startScript(ns, "homigrind_loop.js")) ns.tprint("Grinding karma...");
  if (startScript(ns, "ultimate_spread.js", 'noexpand')) ns.tprint("Spreading...");

  //  this shouldn't be really needed - this script must be executed at the very beginning after restart
  if (force || pl.playtimeSinceLastAug < 100000) {
    // One infiltration run of MegaCorp to gain some init money before we can travel to Aevum for ECorp grinding
    await infiltrate(ns, 'MegaCorp', 1, 'none');
    ns.tprint("Initial MegaCorp infiltration ended.");

    ns.singularity.joinFaction('Shadows of Anarchy');

    buyApps(ns);

    expandServers(ns);
    await infiltrate(ns, 'ECorp', 3, 'none'); // just grind some more to upgrade servers and increase Hack level

    Array.from({ length: 4 }, () => ns.singularity.upgradeHomeRam());

    if (runNumber == 0) {
      //  this must be installed asap so that infiltration is more profitable, but it's cheap so better to move it to end of first run
      ns.singularity.purchaseAugmentation('Shadows of Anarchy', 'SoA - phyzical WKS harmonizer');
    }
    Array.from({ length: 4 }, () => ns.singularity.upgradeHomeRam());
  }

  buyApps(ns);

  while (ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length < 8 && shouldRun) {
    // while ((pl.factions.includes('Daedalus') && !ns.singularity.getOwnedAugmentations(true).includes('The Red Pill')) || ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length < 8 && shouldRun) {
    // so we grind until we install 10 new augmentations.. backdoor on world deamon maybe gets installed automatically :D

    let invites = ns.singularity.checkFactionInvitations();
    for (const factionname of invites) {
      if (runNumber > 2 && ['Sector-12', 'Aevum'].includes(factionname)) continue;

      ns.singularity.joinFaction(factionname);
    }
    let hackingOnly = true;
    if (ns.singularity.getOwnedAugmentations().length >= 25) // suboptimal, but close
      hackingOnly = false;
    let best = findAugmentationToBuy(ns, null, hackingOnly);
    if (!best) {
      // we might need to grind for Daedalus
      if (pl.skills.hacking > 2500 && ns.singularity.getOwnedAugmentations().length > 30 && pl.money < 100000000000 && !pl.factions.includes('Daedalus')) {
        if (ns.isRunning("upgrade_servers.js")) {
          ns.kill("upgrade_servers.js");
          ns.tprint('Killing upgrades to allow Daedalus to pop up');
          console.log('Killing upgrades to allow Daedalus to pop up');
        }
      }
      else {
        if (!ns.isRunning("upgrade_servers.js")) {
          expandPid = ns.exec("expand_servers.js", 'home', 1, 'noprompt');
          if (expandPid != 0)
            ns.tprint("Started server expand loop");
          else
            ns.tprint("ERROR Couldn't start expand loop!!!");
        }
      }
      if (runNumber > 2) {
        if (!pl.factions.includes('Volhaven'))
          ns.singularity.travelToCity('Volhaven');
      }
      if (runNumber >= 2 && runNumber < 3) {
        if (pl.factions.includes('Chongqing'))
          ns.singularity.travelToCity('Ishima');
        else if (pl.factions.includes('Ishima'))
          ns.singularity.travelToCity('New Tokyo');
        else if (pl.factions.includes('New Tokyo'))
          ns.singularity.travelToCity('Chongqing');

      }
      console.log('Grinding money not to sit around idle!!!!');
      await infiltrate(ns, 'ECorp', 1, 'none'); // let's not idle
      await ns.sleep(1000);
      pl = ns.getPlayer();
      continue;
    }
    // let's stop the server expansion for now cause we want to save money for augments
    // if (expandPid && ns.isRunning(expandPid)) {
    //   ns.kill(expandPid);
    // }

    await grindRep(ns, best);
    await grindMoney(ns, best);
    buyAugmentation(ns, best);

    await ns.sleep(1000);
    pl = ns.getPlayer();
  }

  for (const factionname of ns.singularity.checkFactionInvitations()) {
    ns.singularity.joinFaction(factionname);
  }

  let leftoverAugmentation;
  while ((leftoverAugmentation = findAugmentationToBuy(ns, pl.money, false, false)) && shouldRun) {

    // if we still have money to buy any hack augmentations.. but can grind rep
    await grindRep(ns, leftoverAugmentation);
    buyAugmentation(ns, leftoverAugmentation);

    await ns.sleep(1000);
    pl = ns.getPlayer();
  }

  const msg = `Augments installed. Run took: ${timeTakenInSeconds(startDate, new Date())}s`;
  console.log(msg);
  ns.tprint(msg);
  ns.singularity.installAugmentations('singl.js');
}

let infiInfo;
/** @param {NS} ns */
function infiltrationInfo(ns) {
  if (infiInfo) return infiInfo;

  infiInfo = {}
  let infiLocations = ns.infiltration.getPossibleLocations();

  for (const loc in infiLocations) {
    let l = infiLocations[loc];
    infiInfo[l.name] = ns.infiltration.getInfiltration(l.name);
  }
  return infiInfo;
}

/** @param {NS} ns */
function buyAugmentation(ns, aug) {
  let msg;
  let bought = ns.singularity.purchaseAugmentation(aug.faction, aug.aug);
  if (bought) {
    msg = `Augmentation ${aug.aug} in ${aug.faction} bought for ${ns.nFormat(aug.price, "0.0a")}`;
  }
  else {
    msg = `ERROR Couldn't buy augmentation: ${aug.aug} in ${aug.faction}`;
  }
  console.log(msg);
  ns.tprint(msg);
}

async function grindRep(ns, aug) {
  let factionRep = ns.singularity.getFactionRep(aug.faction);
  if (aug.repreq > factionRep) {

    // figure out the number of times and/or target  we need to run the faction grind
    let whatToGrind = fulfillRequestedReputation(infiltrationInfo(ns), aug.repreq - factionRep);
    const company = whatToGrind[0].company;
    const times = whatToGrind[0].times;

    if (whatToGrind.length > 1)//hack before i add it to the method, instead of running the for loop
      times += 1;

    await grindInfiltration(ns, aug, company, times, aug.faction);
  }
}

async function grindMoney(ns, aug) {
  let pl = ns.getPlayer();
  if (aug.price > pl.money) {
    let whatToGrind = fulfillRequestedMoney(infiltrationInfo(ns), aug.price - pl.money);
    const company = whatToGrind[0].company;
    const times = whatToGrind[0].times;

    if (whatToGrind.length > 1)//hack before i add it to the method, instead of running the for loop
      times += 1;
    await grindInfiltration(ns, aug, company, times, 'none');
  }
}
async function grindInfiltration(ns, aug, company, times, faction) {
  let msg = `Grinding ${faction == 'none' ? 'money' : 'rep'} on: ${company} ${times} times to buy ${aug.aug} in ${aug.faction}`;
  console.log(msg);
  ns.tprint(msg);
  await infiltrate(ns, company, times, faction);
}

function fulfillRequestedReputation(infi_info, requestedReputation) {
  const companyArray = Object.entries(infi_info).map(([name, company]) => ({
    name,
    tradeRep: company.reward.tradeRep
  }));

  companyArray.sort((a, b) => a.tradeRep - b.tradeRep);

  let remainingReputation = requestedReputation;
  let optimalCompanies = [];

  let closestCompany = null;
  for (const company of companyArray) {
    const { name, tradeRep } = company;

    if (tradeRep >= requestedReputation) {
      closestCompany = { company: name, times: 1 };
      break;
    }
  }
  if (closestCompany) return [closestCompany];

  companyArray.sort((a, b) => b.tradeRep - a.tradeRep);
  for (const company of companyArray) {
    const { name, tradeRep } = company;
    const timesToWork = Math.ceil(remainingReputation / tradeRep);

    if (timesToWork > 0) {
      debugger;
      optimalCompanies.push({ company: name, times: timesToWork });
      remainingReputation -= timesToWork * tradeRep;
    }
  }

  return optimalCompanies;
}

function fulfillRequestedMoney(infi_info, requestedMoney) {
  const companyArray = Object.entries(infi_info).map(([name, company]) => ({
    name,
    money: company.reward.sellCash
  }));

  companyArray.sort((a, b) => a.tradeRep - b.tradeRep);

  let closestCompany = null;
  for (const company of companyArray) {
    const { name, money } = company;

    if (money >= requestedMoney) {
      closestCompany = { company: name, times: 1 };
      break;
    }
  }
  if (closestCompany) return [closestCompany];

  companyArray.sort((a, b) => b.money - a.money);

  let remainingMoney = requestedMoney;
  let optimalCompanies = [];

  for (const company of companyArray) {
    const { name, money } = company;
    const timesToWork = Math.ceil(remainingMoney / money);

    if (timesToWork > 0) {
      debugger;
      optimalCompanies.push({ company: name, times: timesToWork });
      remainingMoney -= timesToWork * money;
    }
  }

  return optimalCompanies;
}
/** @param {NS} ns */
function findAugmentationToBuy(ns, moneyAvailable = null, hackingOnly = true, noShadows = true) {
  // 1. go through factions joined
  // 2. list the available augmentatinos
  // 3. find the ones that add Hacking skill, exp, power and so on
  // 4. take all skills upgrade into consideration as well
  // Starter kit is also okish, but not the most important since we can run MegaCorp infiltration anyhow
  // some weights system could be the best - like percentage of each skill times weight divided by cost
  // so that we have best value for money and just buy those, but on the other hand we want the most expensive
  // augments first, since each one increases the costs
  //
  let pl = ns.getPlayer();
  const owned = ns.singularity.getOwnedAugmentations(true);
  const augDict = {}

  // Aevum is good for starters - security work + 3 augmentations - neurotrainer, pcmmatrix and Neuralstimulator
  for (const f of pl.factions) {
    augDict[f] = {}
    let augs = ns.singularity.getAugmentationsFromFaction(f);
    for (const aug of augs) {
      if (hackingOnly && aug == 'NeuroFlux Governor') continue;
      if (noShadows && f == 'Shadows of Anarchy') continue;
      if (owned.includes(aug)) continue;
      augDict[f][aug] = {}

      augDict[f][aug].multis = ns.singularity.getAugmentationStats(aug);
      augDict[f][aug].price = ns.singularity.getAugmentationPrice(aug);
      augDict[f][aug].prereq = ns.singularity.getAugmentationPrereq(aug);
      augDict[f][aug].repreq = ns.singularity.getAugmentationRepReq(aug);
    }
  }

  const filteredEntries = [];

  for (const faction in augDict) {
    for (const aug in augDict[faction]) {
      const entry = augDict[faction][aug];
      const { hacking_chance, hacking_speed, hacking_money, hacking_grow, hacking, hacking_exp } = entry.multis;
      // if moneyAvailable provided lets limit only to the ones buyable and where rep is high enough
      if (moneyAvailable && (moneyAvailable < entry.price)) continue;
      // if (moneyAvailable && (moneyAvailable < entry.price || ns.singularity.getFactionRep(faction) < entry.repreq)) continue;
      if (!entry.prereq.every(e => owned.includes(e))) continue; // we want to own all the prereqs
      if (hackingOnly && !(hacking_chance > 1 || hacking_speed > 1 || hacking_money > 1 || hacking_grow > 1 || hacking > 1 || hacking_exp > 1)) continue;

      filteredEntries.push({
        faction,
        aug,
        price: entry.price,
        repreq: entry.repreq,
        multis: entry.multis,

      });

    }
  }

  const sortedEntries = filteredEntries.sort((a, b) => b.price - a.price);
  return sortedEntries[0];
}

/** @param {NS} ns */
function grindCombatForHomicide(ns) {
  if (ns.isRunning("homigrind_loop.js", 'home')) {
    ns.tprint("Grinding homicide already running..");
    return;
  }

  const infiPid = ns.exec("homigrind_loop.js", 'home', 1);
  if (infiPid != 0)
    ns.tprint("Grinding homicide to start a gang..");
  else
    ns.tprint("ERROR Couldn't start karma grinding!!!");
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

    ns.tprint(`ERROR Couldn't start ${scriptName}!!!`);
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

    ns.tprint("Tor and hack programs purchased");
  }
}

/** @param {NS} ns */
async function infiltrate(ns, target, times, faction) {
  if (ns.getPlayer().hp.current < ns.getPlayer().hp.max)
    ns.singularity.hospitalize();
  const infiPid = ns.exec("infi_loop.js", 'home', 1, target, times, faction, 'dontGrind');
  if (infiPid != 0)
    ns.tprint(target + " infiltration started...");
  else
    ns.tprint("ERROR Couldn't start infiltration of " + target + " !!!");

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