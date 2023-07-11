const wnd = eval("window");
const doc = wnd["document"];
/** @param {NS} ns */
export async function main(ns) {
  // co ja tu mogę chcieć?
  // 1. na początku po złamaniu BitNode'a albo od augmentacji zaczynamy z uniwerkiem
  // 2. mozna to do ulti spreada dodać żeby uruchomił, albo lepiej niech to uruchomi ulti spread
  // 3. mozna dodać rozwój home'a o ram do jakichś 15b
  // 4. można potem napierdzielać jakąś pracę w frakcji (Sector-12, Security work) żeby dobić do ~50 statsów żeby zacząć homicidey (moż da się sprawdzić ile jest ) - klepać karmę do 54000 dla gangusów
  // 5. jak już będzie 54000 to założyć gang - dalej automatyzacja gangowa, ale przede wszystkim mamy dostęp do wielu augmentacji
  // 6. założyć corpo?
  let expandPid;
  let pl = ns.getPlayer();
  const startDate = new Date();
  // Augmentations will get installed in bulk of 10
  let runNumber = ns.singularity.getOwnedAugmentations().length % 10;
  if (ns.exec("infi.js", 'home') != 0)
    ns.tprint("Infiltration automated.");
  else
    ns.tprint("ERROR Couldn't automate infiltration!!!");

  if (!ns.isRunning("ultimate_spread.js", 'home'))
    if (ns.exec("ultimate_spread.js", 'home') != 0)
      ns.tprint("Spreading...");
    else
      ns.tprint("ERROR Couldn't start spread loop!!!");

  if (!ns.isRunning("backdoor_loop.js", 'home'))
    if (ns.exec("backdoor_loop.js", 'home') != 0)
      ns.tprint("Backdooring looped...");
    else
      ns.tprint("ERROR Couldn't start backdooring loop!!!");

  //  this shouldn't be really needed - this script must be executed at the very beginning after restart
  if (pl.playtimeSinceLastAug < 10000) {



    // let's learn some hacking at first
    ns.singularity.universityCourse('rothman university', 'Algorithms course', false);

    // One infiltration run of MegaCorp to gain some init money before we can travel to Aevum for ECorp grinding
    await infiltrate(ns, 'MegaCorp', 1);
    ns.tprint("Initial MegaCorp infiltration ended.");

    ns.singularity.upgradeHomeRam();
    ns.singularity.upgradeHomeRam();
    ns.singularity.upgradeHomeRam();
    ns.singularity.upgradeHomeRam();

    ns.singularity.joinFaction('Shadows of Anarchy');

    ns.singularity.purchaseTor();
    ns.singularity.purchaseProgram('BruteSSH.exe');
    ns.singularity.purchaseProgram('FTPCrack.exe');
    ns.singularity.purchaseProgram('relaySMTP.exe');
    ns.singularity.purchaseProgram('HTTPWorm.exe');
    ns.singularity.purchaseProgram('SQLInject.exe');

    ns.tprint("Tor and hack programs purchased");
    ns.singularity.travelToCity('Aevum');


    if (!ns.isRunning("expand_servers.js", 'home', 'noprompt')) {
      expandPid = ns.exec("expand_servers.js", 'home', 'noprompt');
      if (expandPid != 0)
        ns.tprint("Started server expand loop");
      else
        ns.tprint("ERROR Couldn't start expand loop!!!");
    }

    if (runNumber == 0) {
      // 2 runs of ECorp should be enough to buy the harmonizer
      await infiltrate(ns, 'ECorp', 2);
      //  this must be installed asap so that infiltration is more profitable, but it's cheap so better to move it to end of first run
      ns.singularity.purchaseAugmentation('Shadows of Anarchy', 'SoA - phyzical WKS harmonizer');


      // first run on Aevum
      // not sure this is necessary - maybe wait till second run?
      // ns.singularity.joinFaction('Aevum');
      // grindCombatForHomicide('Aevum');
    }
  }

  const infiInfo = infiltrationInfo(ns);


  // ns.codingcontract  !!!


  // let invites = ns.singularity.checkFactionInvitations();

  // let's stop the server expansion for now cause we want to save money for augments
  if (expandPid && ns.isRunning(expandPid)) {
    ns.kill(expandPid);
  }
  let shouldRun = true;

  // we want to make sure we can cancel this loop by pressing ESC
  function handleEscapeKey(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      shouldRun = false;
      doc.removeEventListener('keydown', handleEscapeKey);
      console.log('Escape key pressed. Cancelling singl.js');
      ns.tprint('Escape key pressed. Cancelling singl.js');
    }
  }
  doc.addEventListener('keydown', handleEscapeKey);

  // ns.atExit(() => {

  // });

  while (ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length < 8 && shouldRun) {
    // so we grind until we install 10 new augmentations.. backdoor on world deamon maybe gets installed automatically :D

    // this doesn't have to be super optimal - enough that it's working
    // the most expensive one available..
    // the only problem could be that some are just too expensive
    //  - but those should be available when gang is started or we go super high lvl factions
    pl = ns.getPlayer();
    let best = findBestHackingAugmentation(ns);
    debugger;
    let factionRep = ns.singularity.getFactionRep(best.faction);
    if (best.repreq > factionRep) {

      // figure out the number of times and/or target  we need to run the faction grind
      let whatToGrind = fulfillRequestedReputation(infiInfo, best.repreq - factionRep);

      const company = whatToGrind[0].company;
      const times = whatToGrind[0].times;

      let msg = `Grinding rep on: ${company} to buy ${best.aug} in ${best.faction}`;
      console.log(msg);
      ns.tprint(msg);
      if (whatToGrind.length > 1)//hack before i add it to the method, instead of running the for loop
        times += 1;

      await infiltrate(ns, company, times + 1, best.faction);

      // for (const companyToGrind of whatToGrind) {
      //   // debugger;
      //   // return;
      //   // that's not optimal - cheaper to run ECorp
      //   await infiltrate(ns, companyToGrind.company, companyToGrind.times, best.faction);
      // }
    }
    if (best.price > pl.money) {
      let whatToGrind = fulfillRequestedMoney(infiInfo, best.price - pl.money);
      const company = whatToGrind[0].company;
      const times = whatToGrind[0].times;

      let msg = `Grinding money on: ${company} to buy ${best.aug} in ${best.faction}`;
      console.log(msg);
      ns.tprint(msg);
      if (whatToGrind.length > 1)//hack before i add it to the method, instead of running the for loop
        times += 1;
      await infiltrate(ns, company, times, 'none');
      // for (const companyToGrind of whatToGrind) {
      //   // debugger;
      //   // return;
      //   // that's not optimal - cheaper to run ECorp
      //   await infiltrate(ns, companyToGrind.company, companyToGrind.times);
      // }
    }

    let bought = ns.singularity.purchaseAugmentation(best.faction, best.aug);
    if (bought) {
      let msg = `Augmentation ${best.aug} in ${best.faction} bought.`;
      console.log(msg);
      ns.tprint(msg);
    }
    else
      ns.tprint(`ERROR Couldn't buy augmentation: ${best.aug} in ${best.faction}`);
    // debugger;
    await ns.sleep(1000);
  }
  let leftoverAugmentation;
  while ((leftoverAugmentation = findBestHackingAugmentation(ns, pl.money)) && shouldRun) {
    // debugger;
    // if we still have money to buy any hack augmentations and we have the rep for it, buy them
    let bought = ns.singularity.purchaseAugmentation(leftoverAugmentation.faction, leftoverAugmentation.aug);
    if (bought) {
      let msg = `Augmentation ${leftoverAugmentation.aug} in ${leftoverAugmentation.faction} bought.`;
      console.log(msg);
      ns.tprint(msg);
    }
    else
      ns.tprint(`ERROR Couldn't install augmentation: ${leftoverAugmentation.aug} in ${leftoverAugmentation.faction}`);
    // debugger;
    pl = ns.getPlayer();
    await ns.sleep(1000);
  }

  // maybe we can buy the pill already?


  const msg = `Augments installed. Run took: ${timeTakenInSeconds(startDate, new Date())}s`;
  console.log(msg);
  ns.tprint(msg);
  // ns.singularity.installAugmentations('singl.js');

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
      optimalCompanies.push({ company: name, times: timesToWork });
      remainingMoney -= timesToWork * money;
    }
  }

  return optimalCompanies;
}
/** @param {NS} ns */
function findBestHackingAugmentation(ns, moneyAvailable = null, hackingOnly = true) {
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
      if (moneyAvailable && (moneyAvailable < entry.price || ns.singularity.getFactionRep(faction) < entry.repreq)) continue;
      if (!entry.prereq.every(e => owned.includes(e))) continue; // we want to own all the prereqs
      if ( // hackingOnly
        (hacking_chance > 1 ||
          hacking_speed > 1 ||
          hacking_money > 1 ||
          hacking_grow > 1 ||
          hacking > 1 ||
          hacking_exp > 1)
      ) {
        filteredEntries.push({
          faction,
          aug,
          price: entry.price,
          repreq: entry.repreq,
          multis: entry.multis,

        });
      }
    }
  }

  const sortedEntries = filteredEntries.sort((a, b) => b.price - a.price);
  return sortedEntries[0];
}

/** @param {NS} ns */
function grindCombatForHomicide(ns, faction) {
  if (ns.isRunning("homigrind_loop.js", 'home', faction)) {
    ns.tprint("Grinding homicide already running..");
    return;
  }

  const infiPid = ns.exec("homigrind_loop.js", 'home', 1, faction);
  if (infiPid != 0)
    ns.tprint("Grinding homicide to start a gang..");
  else
    ns.tprint("ERROR Couldn't start karma grinding!!!");
}

/** @param {NS} ns */
async function infiltrate(ns, target, times, faction) {
  const infiPid = ns.exec("infi_loop.js", 'home', 1, target, times, faction, 'dontGrind');
  if (infiPid != 0)
    ns.tprint(target + "infiltration started...");
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