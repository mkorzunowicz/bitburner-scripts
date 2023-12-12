import { getConfiguration } from 'helpers.js'
import { randomString, startScript, log, LogState } from 'common.js'

let corpoName = 'PalMale';
let tobaccoDiv = 'tabac'
let agriDiv = 'ags';
let runOn = 'home';
// let runOn = 'hacknet-server-0';

let shouldRun;
const argsSchema = [
  ['loopMorale', false], // upgrade morale in loop
  ['buyResearchFromHacknet', false], // buy research from hashes
  ['remakeProducts', false], // loop making tobacco products
  ['steadyGrowth', false], // loop making tobacco products
  ['exportLoop', false], // loop making tobacco products
  ['researchLoop', false], // loop making tobacco products
];
export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}
let runOptions;

const _1b = 1_000_000_000;
const _1m = 1_000_000;
const cityNames = ['Aevum', 'Sector-12', 'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima']


/** @param {NS} ns */
export async function main(ns) {

  shouldRun = true;
  runOptions = getConfiguration(ns, argsSchema);

  if (runOptions.loopMorale) {
    while (shouldRun) {
      await bumpMoraleAndEnergy(ns);
      await ns.sleep(1000);
      if (LogState.augmentationCountdown) {
        // we are about to install augmentations - spend the accumulated hashes, as they reset per installation
        debugger
        buyAllFundsFromHacknet(ns);
        buyAllReserachFromHacknet(ns);
      }
    }
    return;
  }

  // one time thing - not required as loop does that later
  if (runOptions.buyResearchFromHacknet) {
    buyAllReserachFromHacknet(ns);
    return;
  }

  if (runOptions.researchLoop) {
    await researchLoop(ns);
    return;
  }

  if (runOptions.remakeProducts) {
    await remakeProducts(ns, 'Tobacco');
    return;
  }

  if (runOptions.exportLoop) {
    await exportLoop(ns);
    return;
  }

  if (runOptions.steadyGrowth) {
    let counter = 0;
    while (shouldRun) {
      await steadyGrowth(ns, 'Tobacco', false, false, true, true, true);
      // await steadyGrowth(ns, null, false, false, true, true, true);
      // await steadyGrowth(ns, null, true, true, true, true, true);
      await ns.sleep(100);
      counter++;
      // let it gather some money every now and then for new products and Wilson
      if (counter % 1000 == 0) {
        counter = 0;

        await ns.sleep(60 * 1000 * 1);
      }
    }
    return;
  }

  // First step: start a corpo if it isnt running





  // I need a fresh way to build up the Corpo from start
  // NOTE: ok I'm done with achievements.. not sure i want to tweak it anymore

  // start with agri, just make up to 13 mln income and start tobacco
  // remember to buy hardware/ai cores/ robots/ real estate to increase production on each division - that's not that important later
  // buy research with Hashes from hacknet
  // buy funds with hashes too at the beginning
  // with tabacco we pracitcally want to make a new product right away
  // buy Research lab and Market TA 1 and 2 - then the price is automatically figured out
  // Agri creates Plants and Food, export Plants to Tabacco - by hand it's kinda shit to figure out how much to export - an algorithm would be so much easier
  // Always keep making a new product once the next is ready, spend 1b for design and marketing
  // this could take a few hours
  // when enough money (~40b) Create spring water, upgrade it a bit and start exporting all the water to agriculture division (we probably need no business or rd, just eng, managers and operations)
  // buy more reasearch for upgrades with hashes
  // keep making new products and adding ops and engs to main city - this speeds up new products
  // buy adverts!!!
  // if you don't have money - wait till new product kicks in and find investors.. but don't take them too eagerly - you can wait for another product and it will greatly increase evaluation
  // buy a chemical division and import Plants and water to it.. upgrade a little - just to support the agriculture enough (also a smart algorithm could be great)
  // with each new product remember to set Market-TA2 on!!!
  // on ~10 iteration it should already be making 1t/s
  // remember about bumping morale!! this is very important - keep at max at all times

  // iterate - adding ppl, means adding the whole chain of prerequisites


  //1. make a new product once a new one is available
  //2. buy Advert or get more workers on main city
  //3. follow main citty with workers -60

  await runCorpo(ns);
}

/** @param {NS} ns */
async function growthLevelReached(ns, level) {
  const { divType, equipment, noOfCities, whLevel, staff, advLevel, upgradesLevel } = level;

  var divs = divType ? ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.type == divType) : ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d));
  for (let div of divs) {
    // adverts
    if (ns.corporation.getHireAdVertCount(div.name) < advLevel)
      return false;
    if (ns.corporation.getDivision(div.name).cities.length < noOfCities)
      return false;
    for (let city of div.cities)
      if (!ns.corporation.hasWarehouse(div.name, city) || ns.corporation.getWarehouse(div.name, city).level < whLevel)
        return false;

    for (let city of div.cities)
      for (let role of staff)
        if (ns.corporation.getOffice(div.name, city).employeeJobs[role.name] < role.count)
          return false;

    for (let city of div.cities)
      for (let eq of equipment)
        if (ns.corporation.getMaterial(div.name, city, eq.name).stored < eq.amount)
          return false;

  }
  // upgrades
  for (let upg of upgradesLevel) {
    if (ns.corporation.getUpgradeLevel(upg.name) < upg.lvl)
      return false;
  }
  return true;
}
/** @param {NS} ns */
async function growTo(ns, level) {
  const { divType, equipment, noOfCities, whLevel, staff, advLevel, upgradesLevel } = level;

  // level upgrades
  for (let upg of upgradesLevel) {
    upgradeTo(ns, [upg.name], upg.lvl);
  }

  var divs = divType ? ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.type == divType) : ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d));
  for (let div of divs) {

    // hire adverts
    while (ns.corporation.getHireAdVertCount(div.name) < advLevel && ns.corporation.getHireAdVertCost(div.name) < ns.corporation.getCorporation().funds)
      ns.corporation.hireAdVert(div.name);

    // expand
    while (ns.corporation.getDivision(div.name).cities.length < noOfCities)
      for (let city of cityNames)
        if (!ns.corporation.getDivision(div.name).cities.includes(city))
          try {
            ns.corporation.expandCity(div.name, city);
          } catch { break; }
    // buy warehouse
    for (let city of ns.corporation.getDivision(div.name).cities) {
      if (!ns.corporation.hasWarehouse(div.name, city))
        ns.corporation.purchaseWarehouse(div.name, city);
    }
    // upgrade warehouse
    for (let city of ns.corporation.getDivision(div.name).cities) {
      while (ns.corporation.hasWarehouse(div.name, city) && ns.corporation.getWarehouse(div.name, city).level < whLevel)
        if (ns.corporation.getCorporation().funds > ns.corporation.getUpgradeWarehouseCost(div.name, city))
          ns.corporation.upgradeWarehouse(div.name, city, 1);
        else break;
    }
    setSell(ns, div.name);

    // hire staff
    for (let city of cityNames) {
      hireStaffTo(ns, div, city, staff);
    }

    // buy equipement
    for (let city of ns.corporation.getDivision(div.name).cities) {
      for (let eq of equipment)
        buyToQuantity(ns, div.name, city, eq.name, eq.amount, true);
    }
  }
}

/** @param {NS} ns */
function setSell(ns, divName) {
  let div = ns.corporation.getDivision(divName);
  for (let city of div.cities) {
    if (!ns.corporation.hasWarehouse(div.name, city)) return;
    if (div.type == 'Agriculture') {
      ns.corporation.sellMaterial(div.name, city, 'Plants', 'MAX', 'MP');
      ns.corporation.sellMaterial(div.name, city, 'Food', 'MAX', 'MP');
    }
    if (div.type == 'Spring Water') {
      ns.corporation.sellMaterial(div.name, city, 'Water', 'MAX', 'MP');
    }
    if (div.type == 'Chemical') {
      ns.corporation.sellMaterial(div.name, city, 'Chemicals', 'MAX', 'MP');
    }
  }
}

/** @param {NS} ns */
async function runCorpo(ns) {
  if (!await startCorpo(ns)) return;

  if (startScript(ns, "zcorp.js", true, '--loopMorale', runOn)) log(ns, "Automating corpo morale...", 'info', 2 * 1000);
  if (!ns.corporation.hasUnlock('Smart Supply'))
    ns.corporation.purchaseUnlock('Smart Supply');
  // init upgrades

  let ags = startIndustry(ns, 'Agriculture', agriDiv);

  let level1 = {
    divType: 'Agriculture',
    equipment: [{ name: 'Hardware', amount: 125 }, { name: 'AI Cores', amount: 75 }, { name: 'Robots', amount: 0 }, { name: 'Real Estate', amount: 27000 }],
    noOfCities: cityNames.length,
    whLevel: 2,
    staff: [{ name: "Operations", count: 1 }, { name: "Engineer", count: 1 }, { name: "Business", count: 1 }],
    advLevel: 1,
    upgradesLevel: [
      { name: 'FocusWires', lvl: 1 },
      // { name: 'Wilson Analytics', lvl: 2 },
      { name: 'Neural Accelerators', lvl: 1 },
      { name: 'Speech Processor Implants', lvl: 1 },
      { name: 'Nuoptimal Nootropic Injector Implants', lvl: 1 },
      { name: 'Smart Factories', lvl: 1 },
    ]
  };

  while (!await growthLevelReached(ns, level1) && shouldRun) {
    await growTo(ns, level1);
    buyAllFundsFromHacknet(ns);
    await ns.sleep(1000);
  }

  log(ns, "Corpo: Stage 2 agriculture started...", 'info', 2 * 1000);
  let level2 = {
    divType: 'Agriculture',
    equipment: [{ name: 'Hardware', amount: 2800 }, { name: 'AI Cores', amount: 2520 }, { name: 'Robots', amount: 96 }, { name: 'Real Estate', amount: 146400 }],
    noOfCities: cityNames.length,
    whLevel: 2,
    staff: [{ name: "Operations", count: 2 }, { name: "Engineer", count: 2 }, { name: "Management", count: 2 }, { name: "Business", count: 1 }],
    advLevel: 1,
    upgradesLevel: [
      { name: 'FocusWires', lvl: 2 },
      // { name: 'Wilson Analytics', lvl: 2 },
      { name: 'Neural Accelerators', lvl: 2 },
      { name: 'Speech Processor Implants', lvl: 2 },
      { name: 'Nuoptimal Nootropic Injector Implants', lvl: 2 },
      { name: 'Smart Factories', lvl: 10 },
      { name: 'Smart Storage', lvl: 10 },
    ]
  };

  while (!await growthLevelReached(ns, level2) && shouldRun) {
    await growTo(ns, level2);
    buyAllFundsFromHacknet(ns);
    await ns.sleep(1000);
  }

  log(ns, "Corpo: Stage 3 agriculture started...", 'info', 2 * 1000);

  let level3 = {
    divType: 'Agriculture',
    equipment: [{ name: 'Hardware', amount: 9300 }, { name: 'AI Cores', amount: 6270 }, { name: 'Robots', amount: 726 }, { name: 'Real Estate', amount: 230400 }],
    noOfCities: cityNames.length,
    whLevel: 5,
    staff: [{ name: "Operations", count: 3 }, { name: "Engineer", count: 3 }, { name: "Management", count: 2 }, { name: "Business", count: 1 }],
    advLevel: 1,
    upgradesLevel: [
      { name: 'FocusWires', lvl: 2 },
      // { name: 'Wilson Analytics', lvl: 2 },
      { name: 'Neural Accelerators', lvl: 2 },
      { name: 'Speech Processor Implants', lvl: 2 },
      { name: 'Nuoptimal Nootropic Injector Implants', lvl: 2 },
      { name: 'Smart Factories', lvl: 10 },
      { name: 'Smart Storage', lvl: 10 },
    ]
  };

  while (!await growthLevelReached(ns, level3) && shouldRun) {
    await growTo(ns, level3);
    buyAllFundsFromHacknet(ns);
    await ns.sleep(1000);
  }

  let tab = startIndustry(ns, 'Tobacco', tobaccoDiv);

  log(ns, "Corpo: Started tobacco...", 'info', 2 * 1000);

  let level4 = {
    divType: 'Tobacco',
    equipment: [{ name: 'Hardware', amount: 0 }, { name: 'AI Cores', amount: 0 }, { name: 'Robots', amount: 0 }, { name: 'Real Estate', amount: 0 }],
    noOfCities: 1,
    whLevel: 5,
    staff: [{ name: "Operations", count: 10 }, { name: "Engineer", count: 10 }, { name: "Management", count: 5 }, { name: "Business", count: 1 }],
    advLevel: 1,
    upgradesLevel: [
      { name: 'FocusWires', lvl: 15 },
      // { name: 'Wilson Analytics', lvl: 1 },
      // { name: 'Neural Accelerators', lvl: 20 },
      // { name: 'Speech Processor Implants', lvl: 20 },
      // { name: 'Nuoptimal Nootropic Injector Implants', lvl: 20 },
      // { name: 'Smart Factories', lvl: 15 },
      // { name: 'Smart Storage', lvl: 15 },
    ]
  };

  if (startScript(ns, "zcorp.js", true, '--remakeProducts', runOn)) log(ns, "Corpo: Automating products...", 'info', 2 * 1000);
  while (!await growthLevelReached(ns, level4) && shouldRun) {
    await growTo(ns, level4);
    buyAllFundsFromHacknet(ns);
    buyAllReserachFromHacknet(ns);
    await ns.sleep(1000);
  }


  // i would wait for the product to get finished, 
  let prods = ns.corporation.getDivision(tobaccoDiv).products.map(p => { return ns.corporation.getProduct(tobaccoDiv, tab.city, p); });
  if (prods.length < 1)
    while (shouldRun && prods.length > 0 && !prods.every(p => p.developmentProgress >= 100))
      await ns.sleep(1000);

  if (!ns.corporation.hasUnlock('Export')) {
    while (ns.corporation.getCorporation().funds < ns.corporation.getUnlockCost('Export'))
      await ns.sleep(1000);
    ns.corporation.purchaseUnlock('Export');
  }

  if (startScript(ns, "zcorp.js", true, '--exportLoop', runOn)) log(ns, "Corpo: Exporting loop...", 'info', 2 * 1000);

  let level5 = {
    divType: 'Tobacco',
    equipment: [{ name: 'Hardware', amount: 0 }, { name: 'AI Cores', amount: 0 }, { name: 'Robots', amount: 0 }, { name: 'Real Estate', amount: 0 }],
    noOfCities: cityNames.length,
    whLevel: 8,
    staff: [{ name: "Operations", count: 3 }, { name: "Engineer", count: 3 }, { name: "Management", count: 2 }, { name: "Business", count: 1 }],
    advLevel: 5,
    upgradesLevel: [
      { name: 'FocusWires', lvl: 20 },
      { name: 'Wilson Analytics', lvl: 1 },
      { name: 'Neural Accelerators', lvl: 20 },
      { name: 'Speech Processor Implants', lvl: 20 },
      { name: 'Nuoptimal Nootropic Injector Implants', lvl: 20 },
      { name: 'Smart Factories', lvl: 15 },
      { name: 'Smart Storage', lvl: 15 },
    ]
  };

  while (!await growthLevelReached(ns, level5) && shouldRun) {
    await growTo(ns, level5);
    buyAllFundsFromHacknet(ns);
    buyAllReserachFromHacknet(ns);
    await ns.sleep(1000);
  }
  log(ns, "Level 5...", 'info', 2 * 1000);


  // that's end game.. we need technical analysis still
  if (startScript(ns, "zcorp.js", true, '--steadyGrowth', runOn)) log(ns, "Corpo: Steady growth...", 'info', 2 * 1000);
  if (startScript(ns, "zcorp.js", true, '--researchLoop', runOn)) log(ns, "Corpo: Research looping...", 'info', 2 * 1000);


  if (!shouldRun) return;

}

/** @param {NS} ns */
async function researchLoop(ns) {
  while (shouldRun) {
    for (let divName of ns.corporation.getCorporation().divisions) {
      let div = ns.corporation.getDivision(divName);
      let techs = [];
      if (div.type == 'Tobacco')
        techs = ['Hi-Tech R&D Laboratory', 'Market-TA.I', 'Market-TA.II', 'uPgrade: Fulcrum', 'uPgrade: Capacity.I', 'Drones', 'Drones - Assembly', 'Drones - Transport'];
      if (div.type == 'Agriculture')
        techs = ['Hi-Tech R&D Laboratory', 'Drones', 'Drones - Assembly', 'Drones - Transport'];
      for (let tech of techs)
        if (!research(ns, div.name, tech)) break;
    }
    await ns.sleep(2000);
  }
}

/** @param {NS} ns */
function research(ns, div, tech) {
  if (ns.corporation.hasResearched(div, tech)) return true;
  else if (ns.corporation.getDivision(div).researchPoints < ns.corporation.getResearchCost(div, tech)) return false;

  ns.corporation.research(div, tech);
  return true;
}


/** @param {NS} ns */
async function exportLoop(ns) {
  while (shouldRun) {
    var divs = ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d));
    for (let div of divs) {
      for (let office of div.cities.map(c => ns.corporation.getOffice(div.name, c))) {
        if (div.type == 'Water') {
          exportMatToSameCityOffice(ns, div, office, 'Agriculture', 'Water');
          exportMatToSameCityOffice(ns, div, office, 'Chemical', 'Water');
        }
        if (div.type == 'Chemical') {
          exportMatToSameCityOffice(ns, div, office, 'Agriculture', 'Chemicals');
        }
        if (div.type == 'Agriculture') {
          exportMatToSameCityOffice(ns, div, office, 'Chemical', 'Plants');
          exportMatToSameCityOffice(ns, div, office, 'Tobacco', 'Plants');
        }
      }
    }
    await ns.sleep(10 * 1000);
  }
}

/** @param {NS} ns */
function exportMatToSameCityOffice(ns, sourceDiv, sourceOffice, industryType, material) {
  var divs = ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d));

  let industry = divs.find(d => d.type == industryType);
  if (industry) {
    let sameCityOffice = industry.cities.map(c => ns.corporation.getOffice(sourceDiv.name, c)).find(c => c.city == sourceOffice.city);
    if (sameCityOffice) {
      try {
        ns.corporation.exportMaterial(sourceDiv.name, sourceOffice.city, industry.name, sameCityOffice.city, material, 'MAX');
      }
      catch { // export already set, but who cares
      }
    }
  }
}

/** @param {NS} ns */
async function startCorpo(ns) {
  let corp;
  try {
    corp = ns.corporation.getCorporation();
  }
  catch
  {
    corp = false;
  }
  if (corp) {
    log(ns, `Corp already exists...`, 'warning');

    return true;
  }
  else {
    // with 150b we can start a corpo - we could grind it first and found it, shouldn't take longer than 15 infi grinds
    while (ns.getPlayer().money < _1b * 150 && shouldRun)
      await ns.sleep(1000);
    if (ns.corporation.createCorporation(corpoName)) {

      log(ns, `Corpo ${corpoName} started`);

      return true;
    }
    log(ns, 'Corpo couldnt start', 'error');
    return false;

  }
}

/** @param {NS} ns */
function startIndustry(ns, type, name) {
  // agriculture
  if (!ns.corporation.getCorporation().divisions.includes(name))
    ns.corporation.expandIndustry(type, name);

  let div = ns.corporation.getDivision(name);
  let office = div.cities.map(c => ns.corporation.getOffice(div.name, c))[0];
  ns.corporation.setSmartSupply(div.name, office.city, true);
  let bus = div.makesProducts ? 1 : 0;

  if (office.employeeJobs.Operations < 2)
    hireStaff(ns, div.name, office.city, 3, 3, bus, 1, 0, 0);
  if (ns.corporation.getWarehouse(div.name, office.city).level < 2)
    bumpWarehouse(ns, div.name, office.city, 2);

  return office;
}




/** @param {NS} ns */
async function steadyGrowth(ns, divType = 'Tobacco', shouldBuyMat = false, extendWh = false, shouldHireStaff = false, hireAdVs = false, buyUpgrades = false) {

  var divs = divType ? ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.type == divType) : ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d));
  for (let div of divs) {

    // hire adverts
    if (hireAdVs && div.makesProducts)
      ns.corporation.hireAdVert(div.name);

    // hire ppl
    if (shouldHireStaff) {
      let biggestOffice = div.cities.map(c => ns.corporation.getOffice(div.name, c)).reduce((first, second) => first.numEmployees > second.numEmployees ? first : second);

      for (let office of div.cities.map(c => ns.corporation.getOffice(div.name, c))) {
        if (office.city == biggestOffice.city)
          hireStaff(ns, div.name, biggestOffice.city, 5, 5, 0, 2, 0, 0);;
        hireStaffUpTo(ns, div.name, office.city, biggestOffice.employeeJobs.Operations - 25, biggestOffice.employeeJobs.Engineer - 25, 0, biggestOffice.employeeJobs.Management - 10, 0, 0);

        ns.corporation.upgradeWarehouse(div.name, office.city, 1);
      }
    }

    let industryData = ns.corporation.getIndustryData(div.type)

    // buy equipement
    // not sure about this - add 10% warehouse for material build up
    if (shouldBuyMat)
      for (let office of div.cities.map(c => ns.corporation.getOffice(div.name, c))) {
        await buyMat(ns, div.name, office.city, 'Hardware', 100000 * industryData.hardwareFactor, extendWh);
        await buyMat(ns, div.name, office.city, 'AI Cores', 100000 * industryData.aiCoreFactor, extendWh);
        await buyMat(ns, div.name, office.city, 'Robots', 100000 * industryData.robotFactor, extendWh);
        await buyMat(ns, div.name, office.city, 'Real Estate', 100000 * industryData.realEstateFactor, extendWh);
      }
  }

  // level upgrades
  if (buyUpgrades)
    upgradeBy(ns, ['Wilson Analytics',
      'FocusWires',
      'Neural Accelerators',
      'Smart Storage',
      'DreamSense',
      'ABC SalesBots',
      'Project Insight',
      'Speech Processor Implants',
      'Nuoptimal Nootropic Injector Implants',
      'Smart Factories'], 1);

}

/** @param {NS} ns */
function upgradeBy(ns, upgrades, upgrBy) {
  for (let upg of upgrades)
    for (let i = 0; i < upgrBy; i++)
      if (ns.corporation.getUpgradeLevelCost(upg) < ns.corporation.getCorporation().funds)
        ns.corporation.levelUpgrade(upg);
}

/** @param {NS} ns */
function upgradeTo(ns, upgrades, upgrTo) {
  for (let upg of upgrades) {
    let level = ns.corporation.getUpgradeLevel(upg);
    while (level < upgrTo && ns.corporation.getUpgradeLevelCost(upg) < ns.corporation.getCorporation().funds) {
      ns.corporation.levelUpgrade(upg);
      level = ns.corporation.getUpgradeLevel(upg);
    }
  }
}


/** @param {NS} ns */
async function buyMat(ns, div, city, mat, qty, noextend = false) {
  let matData = ns.corporation.getMaterialData(mat);
  let req = qty * matData.size;
  let wh = ns.corporation.getWarehouse(div, city);

  let dynStore = wh.size / wh.sizeUsed;

  if (!noextend && req > wh.size - wh.sizeUsed)
    return;

  while (req > wh.size - wh.sizeUsed) {
    await ns.sleep(1);
    ns.corporation.upgradeWarehouse(div, city, 1);
    wh = ns.corporation.getWarehouse(div, city);
  }

  ns.corporation.bulkPurchase(div, city, mat, qty);
}

/** @param {NS} ns */
function buyToQuantity(ns, div, city, mat, qty, expandWh = true) {
  let matData = ns.corporation.getMaterialData(mat);
  let reqSize = qty * matData.size;
  if (!ns.corporation.hasWarehouse(div, city)) return;
  let wh = ns.corporation.getWarehouse(div, city);
  while (reqSize > wh.size - wh.sizeUsed && ns.corporation.getCorporation().funds > ns.corporation.getUpgradeWarehouseCost(div, city)) {
    if (!expandWh) return;
    ns.corporation.upgradeWarehouse(div, city, 1);
    wh = ns.corporation.getWarehouse(div, city);
  }
  if (reqSize > wh.size - wh.sizeUsed) return;
  let stored = ns.corporation.getMaterial(div, city, mat).stored;
  if (stored < qty)
    if (matData.baseCost * (qty - stored) < ns.corporation.getCorporation().funds)
      ns.corporation.bulkPurchase(div, city, mat, qty - stored);
}

/** @param {NS} ns */
function bumpWarehouse(ns, div, city, level) {
  let warehouse = ns.corporation.getWarehouse(div, city);
  if (warehouse.level < level)
    ns.corporation.upgradeWarehouse(div, city, level - warehouse.level);
}

/** @param {NS} ns */
async function remakeProducts(ns, type) {
  while (shouldRun) {

    var divs = type ? ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.type == type) :
      ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.makesProducts);
    for (let div of divs) {

      let office = div.cities.map(c => ns.corporation.getOffice(div.name, c)).reduce((first, second) => first.numEmployees > second.numEmployees ? first : second);

      // let offices = ns.corporation.getDivision(div).cities.map(c => { return ns.corporation.getOffice(div, c); });
      let prods = ns.corporation.getDivision(div.name).products.map(p => { return ns.corporation.getProduct(div.name, office.city, p); });
      for (let prod of prods)
        if (ns.corporation.hasResearched(div.name, 'Market-TA.II'))
          ns.corporation.setProductMarketTA2(div.name, prod.name, true);
        else if (ns.corporation.hasResearched(div.name, 'Market-TA.I'))
          ns.corporation.setProductMarketTA1(div.name, prod.name, true);
        else for (let city of div.cities)
          ns.corporation.sellProduct(div.name, city, prod.name, 'MAX', 'MP');

      while (shouldRun && prods.length > 0 && !prods.every(p => p.developmentProgress >= 100)) {
        await ns.sleep(1000);
        prods = ns.corporation.getDivision(div.name).products.map(p => { return ns.corporation.getProduct(div.name, office.city, p); });

        buyAllFundsFromHacknet(ns);
        buyAllReserachFromHacknet(ns);
      }

      let designInvestment = _1b;
      let advertisingInvestment = _1b;
      let multiplier = 5;
      if (prods.length > 0) {
        const mostExpensive = prods.reduce((first, second) => (second.designInvestment + second.advertisingInvestment) > (first.designInvestment + first.advertisingInvestment) ? second : first);

        designInvestment = mostExpensive.designInvestment * multiplier;
        advertisingInvestment = mostExpensive.advertisingInvestment * multiplier;
      }
      if (ns.corporation.getCorporation().funds < designInvestment + advertisingInvestment) {
        await ns.sleep(2000)

        continue;
      }

      let productCapacity = ns.corporation.hasResearched(div.name, 'uPgrade: Capacity.I') ? 4 : 3;
      if (prods.length == productCapacity) {
        const cheapest = prods.reduce((first, second) => (second.designInvestment + second.advertisingInvestment) < (first.designInvestment + first.advertisingInvestment) ? second : first);
        ns.corporation.discontinueProduct(div.name, cheapest.name);
      }
      let newName = 'Product_' + randomString(5);
      ns.corporation.makeProduct(div.name, office.city, newName, designInvestment, advertisingInvestment);

      // debugger;
    }

    buyAllFundsFromHacknet(ns);
    if (ns.corporation.getCorporation().divisions.length > 1)
      buyAllReserachFromHacknet(ns);
    await ns.sleep(1000);
  }
}

/** @param {NS} ns */
function hireStaffTo(ns, div, city, staff = [{ name: "Operations", count: 1 }, { name: 'Engineer', count: 1 }, { name: 'Business', count: 1 }, { name: 'Management', count: 1 }, { name: 'Research & Development', count: 0 }, { name: 'Intern', count: 0 }]) {
  const office = ns.corporation.getOffice(div.name, city);
  for (let role of staff)
    if (role.count < 0) role.count = 0;

  let expectedSize = staff.reduce((a, v) => a + v.count, 0);

  for (let role of staff)
    for (let i = office.employeeJobs[role.name]; i < role.count; i++) {
      if (office.size < office.numEmployees + expectedSize)
        if (ns.corporation.getOfficeSizeUpgradeCost(div.name, city, 1) > ns.corporation.getCorporation().funds)
          return;
        else
          ns.corporation.upgradeOfficeSize(div.name, city, 1);
      ns.corporation.hireEmployee(div.name, city, role.name);
    }
}
/** @param {NS} ns */
function hireStaffUpTo(ns, div, city, ops, eng, bus, man, rds, int) {
  const office = ns.corporation.getOffice(div, city);
  if (ops < 0) ops = 0;
  if (eng < 0) eng = 0;
  if (bus < 0) bus = 0;
  if (man < 0) man = 0;
  if (rds < 0) rds = 0;
  if (int < 0) int = 0;
  let expectedSize = ops + eng + bus + man + int + rds;

  if (office.size < expectedSize)
    ns.corporation.upgradeOfficeSize(div, city, expectedSize - office.size);
  else {
    while (office.size > expectedSize && expectedSize > 0) {
      let distPoints = office.size - expectedSize;
      if (bus > 0 && distPoints > 0) bus++;
      if (ops > 0 && distPoints > 0) ops++;
      if (eng > 0 && distPoints > 0) eng++;
      if (int > 0 && distPoints > 0) int++;
      if (man > 0 && distPoints > 0) man++;
      if (rds > 0 && distPoints > 0) rds++;
      expectedSize = ops + eng + bus + man + int + rds;
    }
  }
  for (let i = office.employeeJobs.Business; i < bus; i++)
    ns.corporation.hireEmployee(div, city, 'Business');

  for (let i = office.employeeJobs.Operations; i < ops; i++)
    ns.corporation.hireEmployee(div, city, 'Operations');

  for (let i = office.employeeJobs.Engineer; i < eng; i++)
    ns.corporation.hireEmployee(div, city, 'Engineer');

  for (let i = office.employeeJobs.Intern; i < int; i++)
    ns.corporation.hireEmployee(div, city, 'Intern');

  for (let i = office.employeeJobs.Management; i < man; i++)
    ns.corporation.hireEmployee(div, city, 'Management');

  for (let i = office.employeeJobs['Research & Development']; i < rds; i++)
    ns.corporation.hireEmployee(div, city, 'Research & Development');
}

/** @param {NS} ns */
function hireStaff(ns, div, city, ops, engs, bus, mangs, rds, ints) {
  const office = ns.corporation.getOffice(div, city);
  let expectedSize = ops + engs + bus + mangs + ints + rds + office.numEmployees;

  if (office.size < expectedSize)
    ns.corporation.upgradeOfficeSize(div, city, expectedSize - office.size);

  // hire(ns, ops, CoreEmployeePosition.Operations);
  hire(ns, div, city, ops, 'Operations');
  hire(ns, div, city, engs, 'Engineer');
  hire(ns, div, city, bus, 'Business');
  hire(ns, div, city, mangs, 'Management');
  hire(ns, div, city, rds, 'Research & Development');
  hire(ns, div, city, ints, 'Intern');
  // hire(ns, ops, ns.corporation.CoreEmployeePosition.Operations);


}

/** @param {NS} ns */
function hire(ns, div, city, howMany, who) {
  for (let i = 0; i < howMany; i++)
    ns.corporation.hireEmployee(div, city, who);
}


/** @param {NS} ns */
async function bumpMoraleAndEnergy(ns) {
  let corp = ns.corporation.getCorporation();
  for (let div of corp.divisions) {
    let divi = ns.corporation.getDivision(div);
    for (let city of divi.cities) {

      const office = ns.corporation.getOffice(div, city);
      if (office.avgEnergy < office.maxEnergy - 1)
        ns.corporation.buyTea(div, city);
      if (office.avgMorale < office.maxMorale - 1)
        ns.corporation.throwParty(div, city, 1000000)
    }
  }

}

/** @param {NS} ns */
function buyAllReserachFromHacknet(ns) {
  while (ns.hacknet.hashCost("Exchange for Corporation Research", 1) <= ns.hacknet.numHashes())
    ns.hacknet.spendHashes("Exchange for Corporation Research", 1);
}

/** @param {NS} ns */
function buyAllFundsFromHacknet(ns) {
  while (ns.hacknet.hashCost("Sell for Corporation Funds", 1) <= ns.hacknet.numHashes())
    ns.hacknet.spendHashes("Sell for Corporation Funds", 1);
}

/** @param {NS} ns */
async function findInvestors(ns, amount, rev) {
  if (!shouldFindInvestors) return;
  let corp = ns.corporation.getCorporation();

  if (corp.funds < 150000000000 && corp.revenue < rev) {

    let offer = ns.corporation.getInvestmentOffer();
    while (shouldRun && offer.funds < amount) {
      await ns.sleep(1 * 1000);
      offer = ns.corporation.getInvestmentOffer();
    }
    //TODO figure out profit vs offer and steps

    if (shouldRun && offer.funds > amount) {
      ns.corporation.acceptInvestmentOffer();
      log(ns, `CORPO: Took an investment offer for ${offer.funds}`, 'success');
    }
  }
}
