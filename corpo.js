import { log } from 'common.js'
const _1b = 1_000_000_000;
const _1m = 1_000_000;
let shouldRun;
/** Corporations are weird in this version... it doesn't match the document given well.. seems the Corporation gets less money when finding investors
 * On top of that, the Tobacco business isn't working.. The profits are ways smaller
 * @param {NS} ns */
export async function main(ns) {

    // doesn't need API access - could be put outside before 
    // ns.corporation.hasCorporation();
    // the document is a bit outda
    //https://docs.google.com/document/d/e/2PACX-1vTzTvYFStkFjQut5674ppS4mAhWggLL5PEQ_IbqSRDDCZ-l-bjv0E6Uo04Z-UfPdaQVu4c84vawwq8E/pub
    shouldRun = true;
    debugger;

    // Agriculture
    let divName = 'Ags';
    if (!startCorpo(ns, divName)) return;

    if (!shouldRun) return;

    // let corp = ns.corporation.getCorporation();
    // if (corp.revenue < 2000000)
    //     await roundOne(ns);
    // if (corp.revenue < 3000000)
    //     await roundTwo(ns);
    // if (corp.revenue < 11000000)
    //     await roundTwoAndHalf(ns);

    // if (corp.revenue < 11000000)
    //     await roundThree(ns);
    // this sums up agriculture for now

    // await setupTobacco(ns);
    while (shouldRun) {
        await bumpMoraleAndEnergy(ns);
        await ns.sleep(5000);
    }
}

/** @param {NS} ns */
async function setupTobacco(ns) {

    const cities = ['Aevum', 'Sector-12', 'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima']
    let div = 'Tabak';
    let corp = ns.corporation.getCorporation();
    if (!corp.divisions.includes(div)) {
        ns.corporation.expandIndustry('Tobacco', div);
        let divi = ns.corporation.getDivision(div);

        for (let city of cities) {
            if (divi.cities.includes(city)) {
                hireStaff(ns, div, city, 6, 6, 6, 6, 6, 1);
                ns.corporation.makeProduct(div, city, 'Tabak v1', _1b, _1b);
                //     // ns.corporation.sellMaterial(div, city, 'Plants', 'MAX', 'MP');
                //     // ns.corporation.sellMaterial(div, city, 'Food', 'MAX', 'MP');
                //     // ns.corporation.sellProduct(div, city, 'Food', 'MAX', 'MP');
            }
            else {
                ns.corporation.expandCity(div, city);
                ns.corporation.purchaseWarehouse(div, city);
                hireStaff(ns, div, city, 2, 2, 1, 2, 2, 1);
            }
        }
    }
    return true;
}
/** @param {NS} ns */
async function roundOne(ns) {
    const cities = ['Aevum', 'Sector-12', 'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima']
    let corp = ns.corporation.getCorporation();
    for (let div of corp.divisions) {
        let divi = ns.corporation.getDivision(div);
        if (divi.numAdVerts < 1)
            ns.corporation.hireAdVert(div);
        for (let city of cities) {
            if (divi.cities.includes(city)) {
                //     // ns.corporation.sellMaterial(div, city, 'Plants', 'MAX', 'MP');
                //     // ns.corporation.sellMaterial(div, city, 'Food', 'MAX', 'MP');
                //     // ns.corporation.sellProduct(div, city, 'Food', 'MAX', 'MP');
            }
            else {
                ns.corporation.expandCity(div, city);
                ns.corporation.purchaseWarehouse(div, city);
            }
        }
    } if (!shouldRun) return;
    upgrade(ns, ['FocusWires',
        'Neural Accelerators',
        'Speech Processor Implants',
        'Nuoptimal Nootropic Injector Implants',
        'Smart Factories'], 2);
    if (!shouldRun) return;

    corp = ns.corporation.getCorporation();
    for (let div of corp.divisions) {
        let divi = ns.corporation.getDivision(div);
        for (let city of divi.cities) {
            hireStaff(ns, div, city, 1, 1, 1, 0, 0, 0);
            ns.corporation.setSmartSupply(div, city, true);

            ns.corporation.sellMaterial(div, city, 'Plants', 'MAX', 'MP');
            ns.corporation.sellMaterial(div, city, 'Food', 'MAX', 'MP');
            bumpWarehouse(ns, div, city, 3);
            buyToQuantity(ns, div, city, 'Hardware', 125);
            buyToQuantity(ns, div, city, 'AI Cores', 75);
            buyToQuantity(ns, div, city, 'Real Estate', 23000);
        }
    }
    await bumpMoraleAndEnergy(ns, 'Ags');

    if (!shouldRun) return;

    // TDOO maybe add wait for good offer based on revenue    
    // await findInvestors(ns, 150000000000); // it looks like we get 60b only
    await findInvestors(ns, 60000000000, 2000000); // it looks like we get 60b only
}

/** @param {NS} ns */
async function roundTwo(ns) {
    let corp = ns.corporation.getCorporation();
    upgrade(ns, ['Smart Storage', 'Smart Factories'], 4);
    for (let div of corp.divisions) {
        let divi = ns.corporation.getDivision(div);
        for (let city of divi.cities) {
            hireStaff(ns, div, city, 2, 2, 1, 2, 2, 1);
            bumpWarehouse(ns, div, city, 4); // 5 * 150 = 560

            buyToQuantity(ns, div, city, 'Hardware', 150);
            buyToQuantity(ns, div, city, 'Robots', 20);
            buyToQuantity(ns, div, city, 'AI Cores', 90);
            buyToQuantity(ns, div, city, 'Real Estate', 27000);
        }
    }

    await bumpMoraleAndEnergy(ns, 'Ags');
    if (!shouldRun) return;

    await findInvestors(ns, 200000000000, 3000000);
}

/** @param {NS} ns */
async function roundTwoAndHalf(ns) {
    let corp = ns.corporation.getCorporation();
    upgrade(ns, ['Smart Storage', 'Smart Factories'], 11);
    for (let div of corp.divisions) {
        let divi = ns.corporation.getDivision(div);
        for (let city of divi.cities) {
            hireStaff(ns, div, city, 2, 2, 1, 2, 2, 1);
            bumpWarehouse(ns, div, city, 11); // 10 * 200 = 2000

            buyToQuantity(ns, div, city, 'Hardware', 2800);
            buyToQuantity(ns, div, city, 'Robots', 96);
            buyToQuantity(ns, div, city, 'AI Cores', 2520);
            buyToQuantity(ns, div, city, 'Real Estate', 185400);
        }
    }

    await bumpMoraleAndEnergy(ns, 'Ags');
    if (!shouldRun) return;

    await findInvestors(ns, 600000000000, 11000000);
}

/** @param {NS} ns */
async function roundThree(ns) {
    let corp = ns.corporation.getCorporation();
    upgrade(ns, ['Smart Storage', 'Smart Factories'], 15);
    for (let div of corp.divisions) {
        let divi = ns.corporation.getDivision(div);
        for (let city of divi.cities) {
            // hireStaff(ns, div, city, 2, 2, 1, 2, 2, 1);
            bumpWarehouse(ns, div, city, 13); // we want 2000

            buyToQuantity(ns, div, city, 'Hardware', 9300);
            buyToQuantity(ns, div, city, 'Robots', 726);
            buyToQuantity(ns, div, city, 'AI Cores', 6270);
            buyToQuantity(ns, div, city, 'Real Estate', 230400);
        }
    }

    await bumpMoraleAndEnergy(ns, 'Ags');
}
/** @param {NS} ns */
async function findInvestors(ns, amount, rev) {
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
/** @param {NS} ns */
function startCorpo(ns, divName) {
    let corp = ns.corporation.getCorporation();
    if (corp) {
        if (!corp.divisions.includes(divName)) {
            ns.corporation.expandIndustry('Agriculture', divName);
            ns.corporation.purchaseUnlock('Smart Supply');
        }
        return true;
    }
    else {
        if (ns.getPlayer().money > 150000000000) { // with 150b we can start a corpo - we could grind it first and found it, shouldn't take longer than 15 infi grinds
            if (ns.corporation.createCorporation('PitaBurners')) {

                corp = ns.corporation.getCorporation();
                ns.corporation.expandIndustry('Agriculture', divName);
                ns.corporation.purchaseUnlock('Smart Supply');
                log(ns, 'Corpo PitaBurners started');
                return true;
            }
            log(ns, 'Corpo couldnt start', 'error');
            return false;
        }
        return false;
    }
}

/** @param {NS} ns */
async function bumpMoraleAndEnergy(ns, div) {
    if (div) {

        let avgs = ns.corporation.getDivision(div).cities.map(c => { let off = ns.corporation.getOffice(div, c); return { m: off.avgMorale, e: off.avgEnergy }; });

        while (shouldRun && !avgs.every((avg) => avg.m > 99 && avg.e > 99)) {
            let divi = ns.corporation.getDivision(div);
            for (let city of divi.cities) {
                const office = ns.corporation.getOffice(div, city);
                if (office.avgEnergy < 99)
                    ns.corporation.buyTea(div, city);
                if (office.avgMorale < 99)
                    ns.corporation.throwParty(div, city, 1000000)
            }
            await ns.sleep(500);
            avgs = ns.corporation.getDivision(div).cities.map(c => { let off = ns.corporation.getOffice(div, c); return { m: off.avgMorale, e: off.avgEnergy }; });
        }

    }
    let corp = ns.corporation.getCorporation();
    for (let div of corp.divisions) {
        let avgs = ns.corporation.getDivision(div).cities.map(c => { let off = ns.corporation.getOffice(div, c); return { m: off.avgMorale, e: off.avgEnergy }; });

        while (shouldRun && !avgs.every((avg) => avg.m > 99 && avg.e > 99)) {
            let divi = ns.corporation.getDivision(div);
            for (let city of divi.cities) {
                const office = ns.corporation.getOffice(div, city);
                if (office.avgEnergy < 99)
                    ns.corporation.buyTea(div, city);
                if (office.avgMorale < 99)
                    ns.corporation.throwParty(div, city, 1000000)
            }
            await ns.sleep(500);
            avgs = ns.corporation.getDivision(div).cities.map(c => { let off = ns.corporation.getOffice(div, c); return { m: off.avgMorale, e: off.avgEnergy }; });
        }
    }

}
/** @param {NS} ns */
function upgrade(ns, upgrades, level) {
    for (let upg of upgrades)
        upgradeLevel(ns, upg, level);
}

/** @param {NS} ns */
function upgradeLevel(ns, upgrade, level) {
    let count = ns.corporation.getUpgradeLevel(upgrade);
    for (let i = count; i < level; i++)
        ns.corporation.levelUpgrade(upgrade);
}

/** @param {NS} ns */
function buyToQuantity(ns, div, city, mat, qty) {
    let stored = ns.corporation.getMaterial(div, city, mat).stored;
    if (stored < qty)
        ns.corporation.bulkPurchase(div, city, mat, qty - stored);
}

/** @param {NS} ns */
function bumpWarehouse(ns, div, city, level) {
    let warehouse = ns.corporation.getWarehouse(div, city);
    if (warehouse.level < level)
        ns.corporation.upgradeWarehouse(div, city, level - warehouse.level);
}
/** @param {NS} ns */
function hireStaff(ns, div, city, ops, engs, bus, mangs, rds, ints) {
    const office = ns.corporation.getOffice(div, city);
    let expectedSize = ops + engs + bus + mangs + ints + rds;
    if (office.size < expectedSize)
        ns.corporation.upgradeOfficeSize(div, city, expectedSize - office.size);

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


// The Complete Handbook for Creating a Successful Corporation

// Getting Started with Corporations
// To get started, visit the City Hall in Sector-12 in order to create a Corporation. This requires $150b of your own money, but this $150b will get put into your Corporation's funds. If you're in BitNode 3 you also have option to get seed money from the government in exchange for 500m shares. Your Corporation can have many different divisions, each in a different Industry. There are many different types of Industries, each with different properties. To create your first division, click the 'Expand' (into new Industry) button at the top of the management UI. The Agriculture industry is recommended for your first division.

// The first thing you'll need to do is hire some employees. Employees can be assigned to five different positions. Each position has a different effect on various aspects of your Corporation. It is recommended to have at least one employee at each position.

// Each industry uses some combination of Materials in order to produce other Materials and/or create Products. Specific information about this is displayed in each of your divisions' UI.

// Products are special, industry-specific objects. They are different than Materials because you must manually choose to develop them, and you can choose to develop any number of Products. Developing a Product takes time, but a Product typically generates significantly more revenue than any Material. Not all industries allow you to create Products. To create a Product, look for a button in the top-left panel of the division UI (e.g. For the Software Industry, the button says 'Develop Software').

// To get your supply chain system started, purchase the Materials that your industry needs to produce other Materials/Products. This can be done by clicking the 'Buy' button next to the corresponding Material(s). After you have the required Materials, you will immediately start production. The amount and quality/effective rating of Materials/Products you produce is based on a variety of factors, such as your employees and their productivity and the quality of materials used for production.

// Once you start producing Materials/Products, you can sell them in order to start earning revenue. This can be done by clicking the 'Sell' button next to the corresponding Material or Product. The amount of Material/Product you sell is dependent on a wide variety of different factors. In order to produce and sell a Product you'll have to fully develop it first.

// These are the basics of getting your Corporation up and running! Now, you can start purchasing upgrades to improve your bottom line. If you need money, consider looking for seed investors, who will give you money in exchange for stock shares. Otherwise, once you feel you are ready, take your Corporation public! Once your Corporation goes public, you can no longer find investors. Instead, your Corporation will be publicly traded and its stock price will change based on how well it's performing financially. In order to make money for yourself you can set dividends for a solid reliable income or you can sell your stock shares in order to make quick money.

// Tips/Pointers
// -Start with one division, such as Agriculture. Get it profitable on it's own, then expand to a division that consumes/produces a material that the division you selected produces/consumes.

// -Materials are profitable, but Products are where the real money is, although if the product had a low development budget or is produced with low quality materials it won't sell well.

// -The 'Smart Supply' upgrade is extremely useful. Consider purchasing it as soon as possible.

// -Purchasing Hardware, Robots, AI Cores, and Real Estate can potentially increase your production. The effects of these depend on what industry you are in.

// -In order to optimize your production, you will need a good balance of all employee positions, about 1/9 should be interning

// -Quality of materials used for production affects the quality/effective rating of materials/products produced, so vertical integration is important for high profits.

// -Materials purchased from the open market are always of quality 1.

// -The price at which you can sell your Materials/Products is highly affected by the quality/effective rating

// -When developing a product, different employee positions affect the development process differently, some improve the development speed, some improve the rating of the finished product.

// -If your employees have low morale or energy, their production will greatly suffer. Having enough interns will make sure those stats get high and stay high.

// -Don't forget to advertise your company. You won't have any business if nobody knows you.

// -Having company awareness is great, but what's really important is your company's popularity. Try to keep your popularity as high as possible to see the biggest benefit for your sales

// -Remember, you need to spend money to make money!

// -Corporations do not reset when installing Augmentations, but they do reset when destroying a BitNode