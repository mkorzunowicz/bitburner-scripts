import { getConfiguration } from 'helpers.js'
import { randomString, startScript, log } from 'common.js'

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
  ['exportOnlyRequired', false], // loop making tobacco products
  ['steadyGrowth', false], // loop making tobacco products
  ['exportLoop', false], // loop making tobacco products
];
export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}
let runOptions;

const _1b = 1_000_000_000;
const _1m = 1_000_000;
const cities = ['Aevum', 'Sector-12', 'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima']



/** @param {NS} ns */
export async function main(ns) {

  shouldRun = true;
  runOptions = getConfiguration(ns, argsSchema);

  if (runOptions.loopMorale) {
    while (shouldRun) {
      await bumpMoraleAndEnergy(ns);
      await ns.sleep(5000);
    }
    return;
  }
  // one time thing - not required as loop does that
  // potentially we might want to add hacknet upgrades here on start
  if (runOptions.buyResearchFromHacknet) {
    buyAllReserachFromHacknet(ns);
    return;
  }

  if (runOptions.remakeProducts) {
    await remakeProducts(ns, 'Tobacco');
    return;
  }

  if (runOptions.exportOnlyRequired) {
    await exportOnlyRequired(ns, 'water');
    return;
  }

  if (runOptions.exportLoop) {
    await exportLoop(ns);
    return;
  }


  // NOTE: no preparation code for corpo.. do as this says, run --remakeProducts, run --loopMorale, run --steadyGrowth
  // run ultimate_spread.js; run zcorp.js --loopMorale; run zcorp.js --remakeProducts; run zcorp.js --steadyGrowth; run stats.js;
  // to grind augs 
  // run singl.js --grindAugments 

  if (runOptions.steadyGrowth) {
    let counter = 0;
    while (shouldRun) {
      await steadyGrowth(ns, null, false, false, true, true, true);
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
async function runCorpo(ns) {
  debugger
  if (!await startCorpo(ns)) return;

  if (startScript(ns, "zcorp.js", true, '--loopMorale', runOn)) log(ns, "Automating corpo morale...", 'info', 2 * 1000);


  ns.corporation.exportMaterial(agriDiv, ags.city, tobaccoDiv, tab.city, 'Plants', 'MAX');
  ns.corporation.sellMaterial(agriDiv, ags.city, 'Plants', 'MAX', 'MP');
  ns.corporation.limitMaterialProduction(agriDiv, ags.city, 'Food', 0);

  if (!shouldRun) return;


  //  first round in... how to figure this out?
  // let corp = ns.corporation.getCorporation();
  //   if (corp.revenue < 2000000)

  //   //
  //   await findInvestors(ns, _1b * 60, _1m * 200); // it looks like we get 60b only

  // start Corpo
  // expand Agro to all cities
  // get funding
  // start tobacco
  // expand tobacco, make new product
  // start exporting plants from Ags to tobacco
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
    while (ns.getPlayer().money < _1b * 15 && shouldRun)
      await ns.sleep(1000);
    if (ns.corporation.createCorporation(corpoName)) {

      log(ns, `Corpo ${corpoName} started`);
      ns.corporation.purchaseUnlock('Smart Supply');
      // init upgrades
      upgrade(ns, ['FocusWires',
        'Neural Accelerators',
        'Speech Processor Implants',
        'Nuoptimal Nootropic Injector Implants',
        'Smart Factories'], 2);

      // agriculture
      let ags = startIndustry(ns, 'Agriculture', agriDiv);
      let tab = startIndustry(ns, 'Tobacco', tobaccoDiv);

      ns.corporation.exportMaterial(agriDiv, ags.city, tobaccoDiv, tab.city, 'Plants', 'MAX');
      ns.corporation.sellMaterial(agriDiv, ags.city, 'Plants', 'MAX', 'MP');
      ns.corporation.limitMaterialProduction(agriDiv, ags.city, 'Food', 0);

      return true;
    }
    log(ns, 'Corpo couldnt start', 'error');
    return false;

  }
}

/** @param {NS} ns */
function startIndustry(ns, type, name) {
  // agriculture
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
async function bumpDivision(ns, upgLevel, warehouseLvl, ops) {
  if (ns.corporation.getUpgradeLevel('FocusWires') < upgLevel)
    upgrade(ns, ['FocusWires',
      'Neural Accelerators',
      'Speech Processor Implants',
      'Nuoptimal Nootropic Injector Implants',
      'Smart Factories'], upgLevel);

  let div = ns.corporation.getDivision(agriDiv);

  // expand cities
  for (let city of cities) {
    if (!div.cities.includes(city)) {
      ns.corporation.expandCity(div.name, city);
      ns.corporation.purchaseWarehouse(div.name, city);
    }
    let office = ns.corporation.getOffice(div.name, city);
    if (office.employeeJobs.Operations < ops)
      hireStaff(ns, div.name, city, 3, 3, 0, 1, 0, 0);
    ns.corporation.setSmartSupply(div.name, city, true);

    ns.corporation.sellMaterial(div.name, city, 'Plants', 'MAX', 'MP');
    ns.corporation.limitMaterialProduction(div.name, city, 'Food', 0);
    // ns.corporation.sellMaterial(div.name, city, 'Food', 'MAX', 'MP');
    if (ns.corporation.getWarehouse(div.name, city).level < warehouseLvl)
      bumpWarehouse(ns, div.name, city, warehouseLvl);
    // buyToQuantity(ns, div.name, city, 'Hardware', 125);
    // buyToQuantity(ns, div.name, city, 'AI Cores', 75);
    // buyToQuantity(ns, div.name, city, 'Real Estate', 23000);

  }
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


// function desingInProgress(ns, type)
// {

//     var divs = type ? ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.type == type) :
//       ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.makesProducts);
//     for (let div of divs) {

//       let office = div.cities.map(c => ns.corporation.getOffice(div.name, c)).reduce((first, second) => first.numEmployees > second.numEmployees ? first : second);

//       let prods = ns.corporation.getDivision(div.name).products.map(p => { return ns.corporation.getProduct(div.name, office.city, p); });
//       for (let prod of prods)
//         ns.corporation.setProductMarketTA2(div.name, prod.name, true);

//       while (shouldRun && prods.length > 0 && !prods.every(p => p.developmentProgress >= 100)) 
// }


/** @param {NS} ns */
async function steadyGrowth(ns, divType = 'Tobacco', shouldBuyMat = false, extendWh = false, shouldHireStaff = false, hireAdVs = false, buyUpgrades = false) {

  // level upgrades
  if (buyUpgrades)
    upgrade(ns, ['Wilson Analytics',
      'FocusWires',
      'Neural Accelerators',
      'Smart Storage',
      'Smart Factories',
      'DreamSense',
      'ABC SalesBots',
      'Project Insight',
      'Speech Processor Implants',
      'Nuoptimal Nootropic Injector Implants',
      'Smart Factories'], 1);

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
}

/** @param {NS} ns */
function upgrade(ns, upgrades, upgrBy) {
  for (let upg of upgrades)
    for (let i = 0; i < upgrBy; i++)
      if (ns.corporation.getUpgradeLevelCost(upg) < ns.corporation.getCorporation().funds)
        ns.corporation.levelUpgrade(upg);
}


/** @param {NS} ns */
async function expandIndust(ns, div) {
  let d = ns.corporation.getDivision(div);
  for (let city of cities) {
    ns.corporation.cancelExportMaterial(div, city, 'Ags', city, 'Chemicals');
    ns.corporation.exportMaterial(div, city, 'Ags', city, 'Chemicals', 'MAX');
    if (d.cities.includes(city)) continue;

    ns.corporation.expandCity(div, city);
    ns.corporation.purchaseWarehouse(div, city);
    hireStaff(ns, div, city, 3, 3, 0, 1, 0, 0);
  }
}

/** @param {NS} ns */
async function exportOnlyRequired(ns, what) {
  // NOTE: to też nie wiem czy jest konieczne.. w sumie najważniejsze by było miejsce w magazynie - czyli upgrade ludzi i magazynu zawsze równolegle + export max + sell max, żeby nie blokowało magazynów
  // co by miało sens to robić industry pod każde zapotrzebowanie z osobna, najłatwiej tak.. czyli chem ma swój water spring, agro ma swój, i zrobić wtedy matrix, ktory komu i iterować zapotrzebowanie.. czyli główny algorytm napierdala tabacco, a reszta nadgania i wszystko każdemu miastu równolegle
  // spring -> chem1 -> agro -> tabaco
  // agro2 -> chem1
  // spring2 ->agro


  while (shouldRun) {
    let waterRequired = 0;
    let waterProduced = 0;
    // find total water required
    // find total water produced
    // try to export proper amount and sell the rest
    // or upgrade to support the requirement
    let water = ns.corporation.getMaterialData('Water');
    var divs = ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d));
    for (let div of divs) {
      let offices = div.cities.map(c => ns.corporation.getOffice(div.name, c));
      for (let office of offices) {
        let waterMaterial = ns.corporation.getMaterial(div.name, office.city, 'Water');
        if (waterMaterial.productionAmount < 0)
          waterRequired += waterMaterial.productionAmount;
        else
          waterProduced += waterMaterial.productionAmount;
        // debugger;
        // ns.corporation.exportMaterial()
      }

    }

    // debugger;

    await ns.sleep(1000);
    if (waterRequired * -1 > waterProduced) {
      var div = ns.corporation.getCorporation().divisions.map(d => ns.corporation.getDivision(d)).filter(d => d.type == 'Spring Water')[0];
      let industryData = ns.corporation.getIndustryData('Spring Water')
      // continue;
      // debugger;
      // hire staff
      // buy equipment

      for (let office of div.cities.map(c => ns.corporation.getOffice(div.name, c))) {
        hireStaff(ns, div.name, office.city, 2, 2, 0, 1, 0, 0);
        await buyMat(ns, div.name, office.city, 'Hardware', 100000 * industryData.hardwareFactor);
        await buyMat(ns, div.name, office.city, 'AI Cores', 100000 * industryData.aiCoreFactor);
        await buyMat(ns, div.name, office.city, 'Robots', 100000 * industryData.robotFactor);
        await buyMat(ns, div.name, office.city, 'Real Estate', 100000 * industryData.realEstateFactor);
      }
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
function buyToQuantity(ns, div, city, mat, qty) {
  let stored = ns.corporation.getMaterial(div, city, mat).stored;
  if (stored < qty)
    ns.corporation.bulkPurchase(div, city, mat, qty - stored);
}

// /** @param {NS} ns */
// async function buyToQuantity(ns, div, city, mat, qty) {
//   let matData = ns.corporation.getMaterialData(mat);
//   let stored = ns.corporation.getMaterial(div, city, mat).stored;
//   let req = qty - stored;
//   req = req * matData.size;
//   let wh = ns.corporation.getWarehouse(div, city);
//   while (req < wh.size - wh.sizeUsed) {
//     await ns.sleep(1000);
//     ns.corporation.upgradeWarehouse(div, city, 1);
//     wh = ns.corporation.getWarehouse(div, city);
//   }

//   if (stored < qty)
//     ns.corporation.bulkPurchase(div, city, mat, req);
// }

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
        
        buyAllFundsFromHacknet(ns);
        buyAllReserachFromHacknet(ns);
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
  }
}

/** @param {NS} ns */
async function makeProducts(ns) {
  let corp = ns.corporation.getCorporation();
  for (let div of corp.divisions) {
    // let offices = ns.corporation.getDivision(div).cities.map(c => { return ns.corporation.getOffice(div, c); });
    let division = ns.corporation.getDivision(div);
    for (let prod of division.products) {
      ns.corporation.getProduct(div, "Sector-12", prod);
    }

    ns.corporation.setProductMarketTA2(div, 'product', true);

    ns.corporation.discontinueProduct('Tabak_' + randomString(5),)
    ns.corporation.makeProduct(div, "Sector-12", 'Tabak v1', _1b, _1b);
  }
}

/** @param {NS} ns */
function hireStaffUpTo(ns, div, city, ops, engs, bus, mangs, rds, ints) {
  const office = ns.corporation.getOffice(div, city);
  if (ops < 0) ops = 0;
  if (engs < 0) engs = 0;
  if (bus < 0) bus = 0;
  if (mangs < 0) mangs = 0;
  if (rds < 0) rds = 0;
  if (ints < 0) ints = 0;
  let expectedSize = ops + engs + bus + mangs + ints + rds;

  if (office.size < expectedSize)
    ns.corporation.upgradeOfficeSize(div, city, expectedSize - office.size);
  else {
    while (office.size > expectedSize && expectedSize > 0) {
      let distPoints = office.size - expectedSize;
      if (bus > 0 && distPoints > 0) bus++;
      if (ops > 0 && distPoints > 0) ops++;
      if (engs > 0 && distPoints > 0) engs++;
      if (ints > 0 && distPoints > 0) ints++;
      if (mangs > 0 && distPoints > 0) mangs++;
      if (rds > 0 && distPoints > 0) rds++;
      expectedSize = ops + engs + bus + mangs + ints + rds;
    }
  }
  for (let i = office.employeeJobs.Business; i < bus; i++)
    ns.corporation.hireEmployee(div, city, 'Business');

  for (let i = office.employeeJobs.Operations; i < ops; i++)
    ns.corporation.hireEmployee(div, city, 'Operations');

  for (let i = office.employeeJobs.Engineer; i < engs; i++)
    ns.corporation.hireEmployee(div, city, 'Engineer');

  for (let i = office.employeeJobs.Intern; i < ints; i++)
    ns.corporation.hireEmployee(div, city, 'Intern');

  for (let i = office.employeeJobs.Management; i < mangs; i++)
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
    // let avgs = ns.corporation.getDivision(div).cities.map(c => { let off = ns.corporation.getOffice(div, c); return { m: off.avgMorale, e: off.avgEnergy }; });

    // while (shouldRun && !avgs.every((avg) => avg.m > 99 && avg.e > 99)) {
    // while (shouldRun && !avgs.every((avg) => avg.m > 99 && avg.e > 99)) {
    let divi = ns.corporation.getDivision(div);
    for (let city of divi.cities) {

      const office = ns.corporation.getOffice(div, city);
      if (office.avgEnergy < office.maxEnergy - 1)
        ns.corporation.buyTea(div, city);
      if (office.avgMorale < office.maxMorale - 1)
        ns.corporation.throwParty(div, city, 1000000)
    }
    // await ns.sleep(500);
    // avgs = ns.corporation.getDivision(div).cities.map(c => { let off = ns.corporation.getOffice(div, c); return { m: off.avgMorale, e: off.avgEnergy }; });
  }

}

/** @param {NS} ns */
function buyAllReserachFromHacknet(ns) {
  // let upgs = ns.hacknet.getHashUpgrades();

  // debugger;
  while (ns.hacknet.hashCost("Exchange for Corporation Research", 1) <= ns.hacknet.numHashes())
    ns.hacknet.spendHashes("Exchange for Corporation Research", 1);
  // let bank = ns.hacknet.numHashes;
  // let cost = ns.hacknet.hashCost("Exchange for Corporation Research",1);
}

/** @param {NS} ns */
function buyAllFundsFromHacknet(ns) {
  // let upgs = ns.hacknet.getHashUpgrades();

  // debugger;
  while (ns.hacknet.hashCost("Sell for Corporation Funds", 1) <= ns.hacknet.numHashes())
    ns.hacknet.spendHashes("Sell for Corporation Funds", 1);
  // let bank = ns.hacknet.numHashes;
  // let cost = ns.hacknet.hashCost("Exchange for Corporation Research",1);
}