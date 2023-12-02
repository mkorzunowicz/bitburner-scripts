import { log, timeTakenInSeconds, clickByXpath, finByXpath } from 'common.js'

// Small hack to save RAM.
const wnd = eval("window");
const doc = wnd["document"];
let infiRunCounter;
const cityNameLabelXpath = "//*[contains(@class, 'css-cxl1tz')]";
// const cityNameLabelXpath = "//*[@class='css-cxl1tz']"
const infiltrateXpath = "//*[contains(text(), 'Infiltrate Company')]";
const cityXpath = "//*[contains(text(), 'City')]";
const travelXpath = "//*[contains(text(), 'Travel')]";

const sellForXpath = "//*[contains(text(), 'Sell for')]";
const cancelXpath = "//*[contains(text(), 'Cancel Infiltration')]";
const finishedXpath = "//*[contains(text(), 'Infiltration successful!')]";
const closeWorkXpath = "//*[contains(text(), 'Do something else simultaneously')]";


const runningXpath = "//*[contains(text(), 'Level ')]";
const openingInfiScreenXpath = "//*[contains(text(), 'Infiltrating ')]";

let factions = [ //runs of ECorp
    { name: 'CyberSec', expMax: 18750, runs: 1 },
    { name: 'Tian Di Hui', expMax: 75000, runs: 1 },
    { name: 'Netburners', expMax: 10000, runs: 1 },
    { name: 'NiteSec', expMax: 112500, runs: 1 },
    { name: 'BitRunners', expMax: 10000, runs: 5 },
    { name: 'The Black Hand', expMax: 175000, runs: 1 },
    { name: 'Sector-12', expMax: 50000, runs: 1 },
    { name: 'Chongqing', expMax: 10000, runs: 1 },
    { name: 'New Tokyo', expMax: 10000, runs: 1 },
    { name: 'Ishima', expMax: 10000, runs: 1 },
    { name: 'Aevum', expMax: 100000, runs: 1 },
    { name: 'Volhaven', expMax: 10000, runs: 1 },
    { name: 'Shadows of Anarchy', expMax: 10000, runs: 1 },
    { name: 'Slum Snakes', expMax: 10000, runs: 1 },
    { name: 'Tetrads', expMax: 10000, runs: 1 },
    { name: 'Speakers for the Dead', expMax: 10000, runs: 1 },
    { name: 'The Dark Army', expMax: 10000, runs: 1 },
    { name: 'The Syndicate', expMax: 10000, runs: 8 }, //gang?
    { name: 'The Covenant', expMax: 10000, runs: 1 },
    { name: 'Daedalus', expMax: 2500000, runs: 11 },
    { name: 'Illuminati', expMax: 10000, runs: 1 },
    { name: 'Bladeburners', expMax: 10000, runs: 1 },
    { name: 'Church of the Machine God', expMax: 10000, runs: 1 }
]

const citiesOnMap = { 'Aevum': 'A', 'Sector-12': 'S', 'Volhaven': 'V', 'Chongqing': 'C', 'New Tokyo': 'N', 'Ishima': 'I' };

const cityCompanyDict = {
    'Aevum': [
        { name: 'Fulcrum Technologies', levels: 25, factionexp: 118878 },
        { name: 'Bachman & Associates', levels: 15, factionexp: 6516 },
        { name: 'Aevum Police Headquarters', levels: 6, factionexp: 6569 },
        { name: 'ECorp', levels: 37, factionexp: 220000, money: 37961000 },
        { name: 'NetLink Technologies', levels: 6, factionexp: 797 },
        { name: 'Clarke Incorporated', levels: 18, factionexp: 100 },
        { name: 'Rho Construction', levels: 5, factionexp: 100 },
        { name: 'Watchdog Security', levels: 7, factionexp: 100 },
        { name: 'Galactic Cybersystems', levels: 12, factionexp: 100 },
        { name: 'AeroCorp', levels: 12, factionexp: 100 }
    ], 'Sector-12': [
        { name: 'Alpha Enterprises', levels: 10, factionexp: 100 },
        { name: 'MegaCorp', levels: 31, factionexp: 166100 },
        { name: 'Blade Industries', levels: 25, factionexp: 75300 },
        { name: 'Joe\'s Guns', levels: 5, factionexp: 619 },
        { name: 'Four Sigma', levels: 25, factionexp: 11978 },
        { name: 'Carmichael Security', levels: 15, factionexp: 3312 },
        { name: 'DeltaOne', levels: 12, factionexp: 3431 },
        { name: 'Universal Energy', levels: 12, factionexp: 3431 },
        { name: 'Icarus Microsystems', levels: 17, factionexp: 5207 }
    ], 'Volhaven': [
        { name: 'SysCore Securities', levels: 18, factionexp: 4211 },
        { name: 'Omnia Cybersystems', levels: 22, factionexp: 7053 },
        { name: 'OmniTek Incorporated', levels: 25, factionexp: 100 },
        { name: 'Helios Labs', levels: 18, factionexp: 100 },
        { name: 'NWO', levels: 18, factionexp: 222667, money: 3674669488 },
        { name: 'LexoCorp', levels: 15, factionexp: 100 },
        { name: 'CompuTek', levels: 15, factionexp: 100 }
    ], 'Chongqing': [
        { name: 'Solaris Space Systems', levels: 18, factionexp: 100 },
        { name: 'KuaiGong International', levels: 25, factionexp: 100 }
    ], 'New Tokyo': [
        { name: 'DefComm', levels: 17, factionexp: 100 },
        { name: 'VitaLife', levels: 25, factionexp: 100 },
        { name: 'Noodle Bar', levels: 5, factionexp: 1065, money: 3230000 },
        { name: 'Global Pharmaceuticals', levels: 20, factionexp: 100 }
    ], 'Ishima': [
        { name: 'Storm Technologies', levels: 25, factionexp: 100 },
        { name: 'Nova Medical', levels: 12, factionexp: 100 },
        { name: 'Omega Software', levels: 10, factionexp: 100 }
    ],
    getKeyByName(name) {
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const companies = this[key];
                const foundCompany = companies.find(company => company.name === name);
                if (foundCompany) {
                    return key;
                }
            }
        }
        return null; // Return null if name is not found
    }
};

export function autocomplete(data, args) {
    // would be nice if it added \"
    let vals = Object.values(cityCompanyDict).filter((value) => typeof value !== 'function');
    let companies = vals.flatMap(cityCompanies => cityCompanies.map(company => company.name));
    let fs = addQuotesToNames(Object.values(factions).map(faction => faction.name));
    return [...companies, ...fs];
}
function addQuotesToNames(namesArray) {
    return namesArray.map((name) => {
        if (name.includes(' ')) {
            return `"${name}"`;
        } else {
            return name;
        }
    });
}
function findCompanyToHackForFaction(company) {
    // TODO with singularity?
}
/** @param {NS} ns */
export async function main(ns) {

    // ns.singularity.
    let companyToInfiltrate = ns.args[0];
    let timesToRun = ns.args[1];
    let factionToIncrease = ns.args[2];
    let dontGrind = ns.args[3];
    if (factionToIncrease == 'none') factionToIncrease = null;
    if (companyToInfiltrate == 'all') {
        factionToIncrease = 'all';
        companyToInfiltrate = 'ECorp'; // static company - selecting one that would fit the best based on exp required, would be better
        // companyToInfiltrate = 'Noodle Bar';
    }
    if (!companyToInfiltrate) companyToInfiltrate = 'ECorp';
    if (!timesToRun) timesToRun = 9999999;
    // console.clear();

    ns.tprint('Starting infiltration loop. Press Escape to stop.');
    console.log('Starting infiltration loop. Press Escape to stop.');
    let shouldRun = true;

    let count = 0;
    let successful = 0;
    function handleEscapeKey(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            if (shouldRun) {
                try {
                    console.log('Escape key pressed. Cancelling infiltration');
                    clickByXpath(cancelXpath);
                }
                catch (error) { }
            }
            shouldRun = false;
            doc.removeEventListener('keydown', handleEscapeKey);
        }
    }
    doc.addEventListener('keydown', handleEscapeKey);

    ns.atExit(() => {
        doc.removeEventListener('keydown', handleEscapeKey);

        let msg = `Looped Infiltration ended. Successful: ${successful} / ${count}`;

        ns.tprint(msg);
        // log(ns, msg);
    });
    let startDate;
    // let playerFactions = ns.getPlayer().factions; // TODO instead of iterating through all, we could use the joined ones
    while (shouldRun && timesToRun > successful) {
        try {
            let seeLevel = finByXpath(runningXpath);
            let seeEnterScreen = finByXpath(textContainsXpath("Infiltrating ")); // is infi.js running?
            let seeSellFor = finByXpath(sellForXpath);
            let seeWork = finByXpath(closeWorkXpath);

            if (seeSellFor) {
                successful++;
                infiRunCounter ? infiRunCounter++ : infiRunCounter = 1;
                localStorage.setItem('infiRunCounter', infiRunCounter);

                let msg = '';
                if (factionToIncrease) {
                    invokeMouseDownEvent(finByXpath(textContainsXpath('none', 'div'))); // select Faction
                    let faction = factionToIncrease;
                    let runsLeft;
                    if (factionToIncrease === 'all') {
                        //console.log('looking for a faction to trade for');
                        // blind iteration cause no Singularity
                        let f;
                        while (f = factions[0]) {
                            // console.log(f);
                            // console.log('checking ' + f.name);
                            // const f = Object.values(factions)[0];
                            let listElement = textEqualsXpath(f.name, 'li');
                            if (listElement) {
                                f.runs--;

                                if (f.runs == -1) {
                                    factions.shift();
                                    if (factions.length == 0) factionToIncrease = null;
                                }
                                else break;
                            }
                            else {
                                // console.log('faction not joined: ' + f.name);
                                factions.shift();
                            }
                        }
                        if (f) {
                            faction = f.name;
                            runsLeft = f.runs;
                        }
                        else factionToIncrease = null; // lets continue grinding money!
                    }
                    else {
                        if (successful == timesToRun && dontGrind != 'dontGrind') {
                            ns.tprint("Faction runs finished. Grinding money");
                            factionToIncrease = null; timesToRun = 99999;
                        }
                    }
                    await clickByXpath(textEqualsXpath(faction, 'li')); // select the Faction

                    const tradeForXpath = textContainsXpath('Trade for');
                    const tradeForAmount = finByXpath(tradeForXpath).querySelector('span').textContent;

                    // msg += ' Trading for ' + tradeForAmount + ' faction rep to: ' + faction;
                    msg += ` Trading for ${tradeForAmount} faction rep to: ${faction}`;
                    if (runsLeft) msg += ' Runs left: ' + runsLeft;

                    await clickByXpath(tradeForXpath);
                }
                else {
                    const tradeForAmount = finByXpath(sellForXpath).querySelector('span').textContent;
                    msg += " Selling work for " + tradeForAmount;

                    await clickByXpath(sellForXpath);
                }
                msg += ` Took: ${timeTakenInSeconds(startDate, new Date())}s. Successful: ${successful} / ${count}`;
                log(ns, msg.trimStart(), 'success');
                await ns.sleep(200);
            } else if (seeEnterScreen) {
                await clickByXpath(textContainsXpath("Start"));
                await ns.sleep(500);
            } else if (seeWork) {
                await clickByXpath(closeWorkXpath);
                await ns.sleep(500);
            } else if (seeLevel) {
                // console.log("running..");
                await ns.sleep(500);
            } else {
                startDate = new Date();
                count++;
                if (timesToRun > 1)
                    log(ns, 'Running infiltration ' + count + '/' + timesToRun, 'info', 75 * 1000);
                // ns.tprint('Running infiltration ' + count + '/' + timesToRun);
                // console.log('Started infiltration ' + count);
                // ns.tprint('Started infiltration ' + count);
                await startInfiltration(ns, companyToInfiltrate);
                await ns.sleep(500);
            }
        }
        catch (error) {
            if (error.message == 'Company not found.') {
                ns.tprint('Company not found. Aborting. ');
                return;
            }
            console.log('blew up:');
            console.error(error);
            await ns.sleep(2000);
        }
    }
}

function invokeMouseDownEvent(targetElement) {
    if (!targetElement) {
        console.log("No element found at the given coordinates.");
        return;
    }

    const mouseEvent = new MouseEvent("mousedown", {
        view: wnd,
        bubbles: true,
        cancelable: true
    });

    targetElement.dispatchEvent(mouseEvent);
}
async function changeCity(ns, city) {
    if (ns.getPlayer().money < 200000) {
        console.log('Not enough money to travel to the requested company')

        ns.tprint('Not enough money to travel to the requested company');
        return false;
    }
    console.log('Changing city to ' + city);

    await clickByXpath(travelXpath);
    await clickByXpath(textEqualsXpath(citiesOnMap[city]));
    return true;
}
/** @param {NS} ns */
async function startInfiltration(ns, companyToInfiltrate) {
    try {
        let city = cityCompanyDict.getKeyByName(companyToInfiltrate);
        let myCity = ns.getPlayer().city
        if (myCity != city)
            if (!(await changeCity(ns, city))) {
                log(ns, `Oops, no money. Running in the city I'm in: ${myCity}`);

                if (myCity == 'Volhaven') companyToInfiltrate = 'OmniTek Incorporated';
                if (myCity == 'Aevum') companyToInfiltrate = 'ECorp';
                if (myCity == 'Chongqing') companyToInfiltrate = 'KuaiGong International';
                if (myCity == 'Sector-12') companyToInfiltrate = 'MegaCorp';
                if (myCity == 'New Tokyo') companyToInfiltrate = 'VitaLife';
                if (myCity == 'Ishima') companyToInfiltrate = 'Storm Technologies';
                // return false;
            }

        await clickByXpath(cityXpath);
        await clickByXpath(ariaXpath(companyToInfiltrate));
        await clickByXpath(infiltrateXpath, true);
        return true;
    }
    catch {
        throw new Error('Company not found.');
    }
}
function textEqualsXpath(text, type) {
    if (type) return `//${type}[text()="${text}"]`;
    return `//*[text()="${text}"]`;
}

function textContainsXpath(text, type) {
    if (type) return `//${type}[contains(text(), '${text}')]`;
    return `//*[contains(text(), '${text}')]`;
}

function ariaXpath(text) {
    return `//*[@aria-label="${text}"]`;
}

function findElementByAriaLabel(label) {
    const xpath = `//*[@aria-label='${label}']`;
    const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}
