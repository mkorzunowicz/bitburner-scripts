// Small hack to save RAM.
const wnd = eval("window");
const doc = wnd["document"];

const cityNameLabelXpath = "//*[contains(@class, 'css-cxl1tz')]";
// const cityNameLabelXpath = "//*[@class='css-cxl1tz']"
const infiltrateXpath = "//*[contains(text(), 'Infiltrate Company')]";
const cityXpath = "//*[contains(text(), 'City')]";
const travelXpath = "//*[contains(text(), 'Travel')]";

const sellForXpath = "//*[contains(text(), 'Sell for')]";
const cancelXpath = "//*[contains(text(), 'Cancel Infiltration')]";
const finishedXpath = "//*[contains(text(), 'Infiltration successful!')]";
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
        { name: 'Galactic Cybersystems', levels: 12, factionexp: 100 }
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
function findCompanyToHackForFaction(company)
{

}
/** @param {NS} ns */
export async function main(ns) {

    // ns.singularity.
    let companyToInfiltrate = ns.args[0];
    let timesToRun = ns.args[1];
    let factionToIncrease = ns.args[2];
    if (companyToInfiltrate == 'all') {
        factionToIncrease = 'all';
        companyToInfiltrate = 'ECorp'; // static company - selecting one that would fit the best based on exp required, would be better
        // companyToInfiltrate = 'Noodle Bar';
    }
    if (!companyToInfiltrate) companyToInfiltrate = 'ECorp';
    if (!timesToRun) timesToRun = 9999999;

    console.clear();

    ns.tprint('Starting infiltration loop. Press Escape to stop.');
    console.log('Starting infiltration loop. Press Escape to stop.');
    let shouldRun = true;

    let count = 0;
    let successful = 0;
    function handleEscapeKey(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            shouldRun = false;
            console.log('Escape key pressed. Cancelling infiltration');
            clickByXpath(cancelXpath);
        }
    }
    doc.addEventListener('keydown', handleEscapeKey);

    ns.atExit(() => {
        doc.removeEventListener('keydown', handleEscapeKey);

        ns.tprint('Looped Infiltration ended. Successful runs: ' + successful);
        console.log('Looped Infiltration ended. Successful runs: ' + successful);
    });

    let playerFactions = ns.getPlayer().factions;
    while (shouldRun && timesToRun > successful) {
        try {

            let seeLevel = finByXpath(runningXpath);
            let seeEnterScreen = finByXpath(textContainsXpath("Infiltrating ")); // is infi.js running?

            let seeSellFor = finByXpath(sellForXpath);
            // console.log(seeLevel);
            // console.log(seeSellFor);
            if (seeSellFor) {
                // console.log("found sell for");
                successful++;
                if (factionToIncrease) {
                    invokeMouseDownEvent(finByXpath(textContainsXpath('none', 'div'))); // select Faction

                    let faction = factionToIncrease;
                    let runsLeft;
                    if (factionToIncrease === 'all') {
                        console.log('looking for a faction to trade for');
                        // blind iteration cause no Singularity
                        let f;
                        while (f = factions[0]) {
                            // console.log(f);
                            console.log('checking ' + f.name);
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
                                console.log('faction not joined: ' + f.name);
                                factions.shift();
                            }
                        }
                        if (f) {
                            faction = f.name;
                            runsLeft = f.runs;
                        }
                        else factionToIncrease = null; // lets continue grinding money!
                    }
                    await clickByXpath(textEqualsXpath(faction, 'li')); // select the Faction

                    const tradeForXpath = textContainsXpath('Trade for');

                    const tradeForAmount = finByXpath(tradeForXpath).querySelector('span').textContent;

                    const msg = 'trading for ' + tradeForAmount + ' faction rep: ' + faction;
                    console.log(msg);
                    if (runsLeft)
                        // ns.toast('Trading for faction rep: ' + faction + ' Runs left: ' + runsLeft, ToastVariant.SUCCESS, 5000);
                        ns.toast(msg + ' Runs left: ' + runsLeft);
                    else
                        ns.toast(msg);

                    await clickByXpath(tradeForXpath);
                }
                else {

                    const tradeForAmount = finByXpath(sellForXpath).querySelector('span').textContent;

                    console.log("Selling work for " + tradeForAmount);

                    await clickByXpath(sellForXpath);
                }
                await ns.sleep(500);
            }
            else if (seeLevel || seeEnterScreen) {
                // console.log("running..");
                await ns.sleep(2000);
            }
            else {
                count++;
                console.log('Started infiltration ' + count + " Successful: " + successful);
                ns.tprint('Started infiltration ' + count);
                ns.toast('Started infiltration ' + count + " Successful: " + successful);
                await startInfiltration(ns, companyToInfiltrate);
                await ns.sleep(2000);
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
        if (ns.getPlayer().city != city)
            if (!(await changeCity(ns, city)))
                return false;

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

async function clickElementTrusted(elem) {
    // console.log(elem);
    try {
        await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
    }
    catch {

        await elem[Object.keys(elem)[1]].onMouseDown({ isTrusted: true });
    }
}

function finByXpath(xpath) {
    return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

/** @param {NS} ns */
async function clickByXpath(xpath, trusted) {
    let element = finByXpath(xpath);
    if (element) {
        // Button found, do something with it
        if (trusted)
            await clickElementTrusted(element);
        else
            element.click(); // Example: Perform a click on the button
        // console.log("Clicked by xpath: " + xpath);
        return true;
    } else {
        // Button not found
        console.log("Element to click not found.: " + xpath);
        // ns.tprint("Button not found.");
        return false;
    }
}

function findElementByAriaLabel(label) {
    const xpath = `//*[@aria-label='${label}']`;
    const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}

