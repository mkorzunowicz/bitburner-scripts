import { log, timeTakenInSeconds, crackPorts, jumpTo, formatDuration, startScript, numberOfPortsOpenable, findNextBitNode, clickByXpath, timeSinceBitNodeReset, LogState } from 'common.js'

const wnd = eval("window");
const doc = wnd["document"];
const AUGS_PER_RUN = 6; // some smarter way to grind Fluxes is needed.. re grinding rep might be sub optimal
let shouldRun = true;
let singlRunNumber;
let shouldKillWorldDaemon = true;
/** This scripts takes advantage of automated Infiltration to the max - it starts by runing intro runs to gather money, buy home cpu and ram upgrades, buy tor and hacks.
 * Then it iterates through available Hacking augmentations and tries to buy all of the available ones. Avoids direct Combat skill multipliers (not combat exp though)
 * as it reduces infiltration rewards, which is crucial for us. We can upgrade combat skills after about 20 hours (depnding on the BN) when there is enough money generated through scripts,
 * skip infiltration altogether and just wait for money to flow in to donate money for rep and buy augs. This should be after we join gang (therefore possibly have QLink from gang or Illuminati).
 * There are additional scripts running in the background: homigrind - to grind homicide and gym; sleeve - to automate sleeves to help with grinding homicide and skills (for now); ultimate_spread - 
 * automating hacking on available servers; upgrade_ expand_servers - purchasable buy/upgrades. start script - which decides when to run singl.js (you might not have singularity yet);
 * backdoor_loop - backdoors servers in the background.
 * REQUIRES Singularity as the name implies.
 * 
 * Press ESC to stop running (both infi and singl will be stopped)!
 *  @param {NS} ns */
export async function main(ns) {

  // shouldKillWorldDaemon = ns.args[0] && ns.args[0].toLowerCase() === 'false';
  startScript(ns, "infi.js");
  // if (startScript(ns, "infi.js")) log(ns, "Infiltration automated.");
  if (!singlRunNumber) singlRunNumber = 1;
  // const resetInfo = ns.getResetInfo(); const lastAugReset = resetInfo.lastAugReset; ns.tprint(`The last augmentation reset was: ${new Date(lastAugReset)}`); ns.tprint(`It has been ${Date.now() - lastAugReset}ms since the last augmentation reset.`);
  shouldRun = true;
  //TODO: 1. calculate the max amount of ram and possible speed per second that we can achieve + cost 

  // why is BN10 so fast all of a sudden??
  // TODO: 2. imlement GRAFTING!!!
  // TODO: Implement CORPO
  // IMPLEMENT BitRunners and sleeves!

  ns.disableLog('ALL');
  let force = ns.args[0];
  const infi = new Infiltration(ns);
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

  const startDate = new Date();
  // Augmentations will get installed in bulk of 10
  let runNumber = Math.floor(ns.singularity.getOwnedAugmentations().length / AUGS_PER_RUN);

  // if (startScript(ns, "infi.js")) log(ns, "Infiltration automated.");
  // startScript(ns, "stats.js")
  if (startScript(ns, "homigrind_loop.js")) log(ns, "Grinding karma...");
  if (startScript(ns, "sleeve.js")) log(ns, "Automating sleeves...");
  if (startScript(ns, "ultimate_spread.js", false, 'noexpand')) log(ns, "Spreading...");

  //  this shouldn't be really needed - this script must be executed at the very beginning after restart
  if (force || !ns.hasTorRouter() || numberOfPortsOpenable(ns) < 5) {
    await runIntro(ns, infi, runNumber);
  }

  // await upgradeHome(ns, infi, 3, 8192 * 2); // this takes too long - 1,5h.. better to start when homi is reachable
  if (!shouldRun) { log(ns, 'Escape key pressed. Cancelling singl.js', 'error'); return; }

  await killW0r1dD43m0n(ns);
  // // if (runNumber < 8) {
  // if (ns.getPlayer().skills.hacking < 2500) {
  //   stopExpandingServers(ns);
  // }
  await grindAugmentations(ns, infi, runNumber);
  if (!shouldRun) { log(ns, 'Escape key pressed. Cancelling singl.js', 'error'); return; }

  for (const factionname of ns.singularity.checkFactionInvitations()) {
    if (ns.singularity.joinFaction(factionname))
      log(ns, `Joined: ${factionname}`, 'warning');
  }

  while (ns.singularity.upgradeHomeRam())
    log(ns, `Upgraded ram to ${ns.getServer('home').maxRam} on aug install`, 'success', 5 * 1000, true);

  while (ns.singularity.upgradeHomeCores())
    log(ns, `Upgraded cores to ${ns.getServer('home').cpuCores} on aug install`, 'success', 5 * 1000, true);

  singlRunNumber++;

  let counter = 10;
  log(ns, `Installing Augmentations in ${counter}s. Press ESC to cancel. `, 'warning', 1000 * 10);
  while (counter-- > 0 && shouldRun) {
    ns.toast(counter, 'warning', 1000);
    await ns.sleep(1000);
  }
  log(ns, `AUGMENTS INSTALLED. Run took: ${formatDuration(ns.getTimeSinceLastAug() / 1000)}`, 'success', 60000, true);

  ns.singularity.installAugmentations('starter.js');
}

/** Intro runs - run once, buy tor and hack tools.
 * Then grind different faction each run 
 * @param {NS} ns */
async function runIntro(ns, infi, runNumber) {
  stopExpandingServers(ns);
  let moneyGrindCount = 3;
  while (moneyGrindCount-- < 0)
    await ns.sleep(1000);
  if (ns.getPlayer().money < 300000000) {
    log(ns, 'Running pre intro infiltration', 'info', 70 * 1000);
    // One infiltration run of MegaCorp/ECorp to gain some init money before we can travel to Aevum for ECorp grinding
    if (ns.singularity.travelToCity('Aevum'))
      await infi.infiltrate('ECorp', 1, 'none');
    else
      await infi.infiltrate('MegaCorp', 1, 'none');
  }

  if (ns.singularity.joinFaction('Shadows of Anarchy'))
    log(ns, `Joined: ${'Shadows of Anarchy'}`, 'warning');
  buyApps(ns);
  expandServers(ns);
  if (startScript(ns, "backdoor_loop.js")) log(ns, "Backdooring...");

  // split to allow different Factions to pop up
  if (runNumber == 1) await runIntroInfi(ns, infi, 'Sector-12', 'MegaCorp');
  if (runNumber == 2) await runIntroInfi(ns, infi, 'Aevum', 'ECorp');
  if (runNumber == 3) await runIntroInfi(ns, infi, 'Chongqing', 'KuaiGong International');
  if (runNumber == 4) await runIntroInfi(ns, infi, 'Ishima', 'VitaLife');
  if (runNumber == 5) await runIntroInfi(ns, infi, 'New Tokyo', 'Storm Technologies');
  if (runNumber == 6) await runIntroInfi(ns, infi, 'Volhaven', 'OmniTek Incorporated');

  // ns.singularity.purchaseAugmentation('Shadows of Anarchy', 'SoA - phyzical WKS harmonizer');

  if (runNumber == 0) {
    Array.from({ length: 6 }, () => {
      if (ns.singularity.upgradeHomeRam())
        log(ns, `Upgraded ram to ${ns.getServer('home').maxRam} on intro`, 'success', 5 * 1000, true);
    });
    Array.from({ length: 6 }, () => {
      if (ns.singularity.upgradeHomeCores())
        log(ns, `Upgraded cores to ${ns.getServer('home').cpuCores} on intro`, 'success', 5 * 1000, true);
    });
  }
}

/** @param {NS} ns */
async function runIntroInfi(ns, infi, cityFaction, company) {
  if (!ns.getPlayer().factions.includes(cityFaction)) {
    log(ns, `Running ${cityFaction} intro infiltration`, 'info', 70 * 1000);
    await infi.infiltrate(company, 1, 'none');
    ns.singularity.joinFaction(cityFaction);
  }
}
/** Upgrade home ram and cores with infi
 *  @param {NS} ns 
 * @param {Infiltration} infi
*/
async function upgradeHome(ns, infi, cores = 3, ram = 8192 * 2) {
  stopExpandingServers(ns);

  let h = ns.getServer('home');
  while (h.cpuCores < cores && shouldRun) {
    let cost = ns.singularity.getUpgradeHomeCoresCost();
    await infi.grindMoney({ aug: `cores to ${h.cpuCores + 1}`, faction: 'home', price: cost });
    if (ns.singularity.upgradeHomeCores())
      log(ns, `Upgraded home cores to ${h.cpuCores + 1}`);
    await ns.sleep(500);
    h = ns.getServer('home');
  }
  while (h.maxRam < ram && shouldRun) {
    let cost = ns.singularity.getUpgradeHomeRamCost();
    await infi.grindMoney({ aug: `ram to ${h.maxRam * 2}`, faction: 'home', price: cost });
    if (ns.singularity.upgradeHomeRam())
      log(ns, `Upgraded home ram to ${h.maxRam * 2}`);
    await ns.sleep(500);
    h = ns.getServer('home');
  }
}

/** @param {NS} ns 
 * @param {Infiltration} infi
*/
async function grindAugmentations(ns, infi, runNumber) {
  let pl = ns.getPlayer();

  let prioFactions = [];
  if (runNumber == 1) prioFactions = ['Sector-12'];
  if (runNumber == 2) prioFactions = ['Aevum'];
  if (runNumber == 3) prioFactions = ['Chongqing'];
  if (runNumber == 4) prioFactions = ['Ishima'];
  if (runNumber == 5) prioFactions = ['New Tokyo'];
  if (runNumber == 6) prioFactions = ['Volhaven'];

  // prioFactions.push('The Black Hand', 'CyberSec', 'NiteSec');

  while (shouldRun && ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations().length < AUGS_PER_RUN || (shouldRun && ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'GRAFTING')) {
    let installed = ns.singularity.getOwnedAugmentations(true).filter((aug) => !ns.singularity.getOwnedAugmentations().includes(aug));
    if (installed.includes('QLink')) break;
    startScript(ns, "backdoor_loop.js");
    let invites = ns.singularity.checkFactionInvitations();
    for (const factionname of invites) {
      if (runNumber > 2 && ['Sector-12', 'Aevum'].includes(factionname)) continue; // TODO: fix this based on prioFactions?

      if (ns.singularity.joinFaction(factionname))
        log(ns, `Joined: ${factionname}`, 'warning');
    }

    // let hackingOnly = false;
    let hackingOnly = true; // combat stats multiplier impact infiltration rewards.. hacking only makes sense
    // if (ns.singularity.getOwnedAugmentations().length >= 22) // suboptimal, but close
    // hackingOnly = false;
    // neuroflex also impacts combat skills and joining a gang becomes necessary.. maybe makes no sense to buy it, since i have to wait either way
    // calculate neuroflex impact on Infiltration rewards?
    let best = findAugmentationToBuy(ns, null, hackingOnly, true, prioFactions, true);
    if (!best) {
      // we might need to grind for Daedalus
      if (!ns.singularity.getOwnedAugmentations(true).includes('The Red Pill')) {
        //TODO: Deadalus augmentation number requirements is dynamic
        if (pl.skills.hacking > 2500 && ns.singularity.getOwnedAugmentations().length > 30 && pl.money < 100000000000 && !pl.factions.includes('Daedalus')) {

          // stopExpandingServers(ns);
          log(ns, 'Killing upgrades to allow Daedalus to pop up');
        }
        // else {
        //   expandServers(ns);
        // }
      }
      // nothing to augment, let's enable upgrades and run grind some money
      expandServers(ns);
      log(ns, 'Nothing to buy... just grinding money', 'warning');
      await infi.infiltrate('ECorp', 1, 'none');
      // console.log('Grinding money not to sit around idle!!!!');
      // await infiltrate(ns, 'ECorp', 1, 'none'); // let's not idle
      await ns.sleep(1000);
      pl = ns.getPlayer();
      continue;
    }

    if (await infi.grindRep(best)) {
      if (!shouldRun) break;

      stopExpandingServers(ns); // stop before grinding money
      await infi.grindMoney(best);

      if (!shouldRun) break;
      buyAugmentation(ns, best);
    }

    await killW0r1dD43m0n(ns); // check and try to destroy the BitNode
    if (ns.getPlayer().skills.hacking > 3000)
      expandServers(ns);
    await ns.sleep(1000);
    pl = ns.getPlayer();
  }

  if (shouldRun)
    log(ns, `Got ${AUGS_PER_RUN}, checking leftover augs`, 'warning', 10 * 1000);
  let leftoverAugmentation;
  while (shouldRun && (leftoverAugmentation = findAugmentationToBuy(ns, ns.getPlayer().money, true, true, prioFactions, false))) {
    // if we still have money to buy any hack augmentations.. but can grind rep
    if (leftoverAugmentation.repRuns > 30) {
      log(ns, `Leftover would take ${leftoverAugmentation.repRuns} to run.. skipping as it's more than 30`, 'warning', 10 * 1000);
      break;
    }
    await infi.grindRep(leftoverAugmentation);
    buyAugmentation(ns, leftoverAugmentation);

    await ns.sleep(1000);
    pl = ns.getPlayer();
  }
}
function infiRunCount() {
  let infiCounter = localStorage.getItem('infiRunCounter');
  if (infiCounter) return Number.parseInt(infiCounter);
  else return 0;
}
/** @param {NS} ns */
function buyAugmentation(ns, aug) {
  if (ns.singularity.purchaseAugmentation(aug.faction, aug.aug)) {
    // if (aug.aug == 'The Red Pill')
    //   log(ns, `${aug.aug} bought`, 'success', 1 * 1000, true);
    log(ns, `Augmentation ${aug.aug} in ${aug.faction} bought for ${ns.nFormat(aug.price, "0.0a")}`, 'success', 30 * 1000, true);
  }
  else
    log(ns, `Couldn't buy augmentation: ${aug.aug} in ${aug.faction}`, 'warning');
}

/** Returns the currently best Augmentation that is available to the user with the given parameters
 * @param {NS} ns 
 * @param {number} moneyAvailable If not null it will limit selection to augmentations that are currently affordable
 * @param {boolean} hackingOnly Limit to augmentations which have hacking multipliers
 * @param {boolean} noShadows Filter out Shadows of Anarchy faction if true
 * @param {Array<string>} prioritizeFactions Array of factions which should be prioritized during selection
 * */
function findAugmentationToBuy(ns, moneyAvailable = null, hackingOnly = true, noShadows = true, prioritizeFactions = [], allowNeuroFlux = false) {
  let pl = ns.getPlayer();
  const owned = ns.singularity.getOwnedAugmentations(true);
  const notInstalled = owned.length - ns.singularity.getOwnedAugmentations(false).length;
  const augDict = {}
  const factionrep = Object.fromEntries(ns.getPlayer().factions.map(f => [f, ns.singularity.getFactionRep(f)]));
  const specialAugs = ['Neuroreceptor Management Implant', 'SoA - phyzical WKS harmonizer'];

  for (const f of pl.factions) {
    augDict[f] = {}
    let augs = ns.singularity.getAugmentationsFromFaction(f);
    for (const aug of augs) {
      // if (hackingOnly && aug == 'NeuroFlux Governor') continue;
      // if (noShadows && f == 'Shadows of Anarchy') continue;
      if (aug != 'NeuroFlux Governor' && owned.includes(aug)) continue;
      augDict[f][aug] = {};

      augDict[f][aug].multis = ns.singularity.getAugmentationStats(aug);
      augDict[f][aug].price = ns.singularity.getAugmentationPrice(aug);
      augDict[f][aug].prereq = ns.singularity.getAugmentationPrereq(aug);
      augDict[f][aug].repreq = ns.singularity.getAugmentationRepReq(aug);
      augDict[f][aug].facrep = factionrep[f];
    }
  }
  // these will diminish Infiltration rewards, but are required to hit Covenant and Illuminati and are usually available from gang
  // const combatAllRounders = ['Bionic Spine', 'HemoRecirculator', 'Graphene Bionic Spine Upgrade'];  // CordiARC Fusion Reactor is 35% combat skills and exp.. we install the STPN from Covenant which gives 75% as well.. which might be enough as well
  const combatAllRounders = ['CordiARC Fusion Reactor', 'Bionic Spine', 'HemoRecirculator'];
  const highestInfi = Infiltration.bestInfiltration;
  const filteredEntries = [];
  for (const faction in augDict) {
    for (const aug in augDict[faction]) {
      const entry = augDict[faction][aug];
      const { hacking_chance, hacking_speed, hacking_money, hacking_grow, hacking, hacking_exp } = entry.multis;
      const { strength, strength_exp, dexterity, dexterity_exp, agility, agility_exp, defense, defense_exp } = entry.multis;
      // if moneyAvailable provided lets limit only to the ones buyable and where rep is high enough
      if (moneyAvailable && (moneyAvailable < entry.price)) continue;
      if (noShadows && faction == 'Shadows of Anarchy')
        if (!specialAugs.includes(aug)) continue; // harmonizer increases rewards, so we want it ASAP (if not bought at first run for whatever reason)
      // if (moneyAvailable && (moneyAvailable < entry.price || ns.singularity.getFactionRep(faction) < entry.repreq)) continue;
      if (!entry.prereq.every(e => owned.includes(e))) continue; // we want to own all the prereqs
      const isHacking = hacking_chance > 1 || hacking_speed > 1 || hacking_money > 1 || hacking_grow > 1 || hacking > 1 || hacking_exp > 1;
      // const isCombat = strength > 1 || strength_exp > 1 || dexterity > 1 || dexterity_exp > 1 || agility > 1 || agility_exp > 1 || defense > 1 || defense_exp > 1;
      const isCombat = strength > 1 || dexterity > 1 || agility > 1 || defense > 1; // let's exclude non exp only

      //if got less than 50 augs allow hacking only and NeuroFlux
      if (owned.length < 50) {
        if (hackingOnly && isCombat && !isHacking && aug != 'NeuroFlux Governor') continue;
      }
      // else allow hacking only and NeuroFlux or one of the combatAllRunders
      else if (!combatAllRounders.includes(aug) && (hackingOnly && isCombat && !isHacking && aug != 'NeuroFlux Governor')) continue;

      if (!allowNeuroFlux && aug == 'NeuroFlux Governor') continue; // let's skip non combat because of infiltration, but charisma and special add to augmentation number

      // if (hackingOnly && !isHacking) // hacking exclusively
      //   if (!specialAugs.includes(aug)) continue; // Neuroreceptor is helpful for background works so we want to buy it asap as well - not focused bonus from Tian Di Hui
      if (faction == 'Bladeburners' && entry.repreq > factionrep[faction]) continue; // Bladeburners can't grind rep through Infiltration

      filteredEntries.push({
        faction,
        aug,
        price: entry.price,
        repreq: entry.repreq,
        multis: entry.multis,
        facrep: entry.facrep,
        isHacking: isHacking,
        isCombat: isCombat,
        repRuns: entry.repreq <= entry.facrep ? 0 : Math.ceil((entry.repreq - entry.facrep) / highestInfi.reward.tradeRep),
        moneyRuns: pl.money >= entry.price ? 0 : Math.ceil((entry.price - pl.money) / highestInfi.reward.sellCash),
        isNeuroFlux: aug === 'NeuroFlux Governor',
        isPrio: prioritizeFactions.includes(faction)
      });

    }
  }
  // debugger;
  const moneyRunsLimit = 50; // if we already have augmentations installed and they are crazy expensive.. put them at the bottom of the list
  const sortedEntries = filteredEntries.sort((a, b) => {
    if (a.aug === 'Neuroreceptor Management Implant' && b.aug !== 'Neuroreceptor Management Implant') return -1; // not focused bonus from Tian Di Hui
    if (a.aug !== 'Neuroreceptor Management Implant' && b.aug === 'Neuroreceptor Management Implant') return 1; // not focused bonus from Tian Di Hui

    if (notInstalled > 0 && a.moneyRuns > moneyRunsLimit && b.moneyRuns <= moneyRunsLimit) return 1;
    else if (notInstalled > 0 && a.moneyRuns <= moneyRunsLimit && b.moneyRuns > moneyRunsLimit) return -1;
    // it's mostly about QLink.. put it below.. that's a bit too harsh i'm afraid, even if it's going to take a long time
    // if (a.moneyRuns > moneyRunsLimit && b.moneyRuns <= moneyRunsLimit) return 1;
    // else if (a.moneyRuns <= moneyRunsLimit && b.moneyRuns > moneyRunsLimit) return -1;

    if (a.isNeuroFlux && !b.isNeuroFlux) return 1;
    else if (!a.isNeuroFlux && b.isNeuroFlux) return -1;

    if (!a.isNeuroFlux && !b.isNeuroFlux) {
      if (a.isPrio && !b.isPrio) return -1;
      else if (!a.isPrio && b.isPrio) return 1;
    }
    if (a.isHacking && !b.isHacking) return -1;
    else if (!a.isHacking && b.isHacking) return 1;

    if (a.price !== b.price) return b.price - a.price; // Sort by price in descending order
    // if (a.price !== b.price) return a.price - b.price; // Sort by price in ascending order
    else if (a.facrep !== b.facrep) return b.facrep - a.facrep; // Sort by facrep in descending order
    else return 0;
  });

  return sortedEntries[0];
}

/**  If we got the Pill and required skill, backdoor the world daemon. Finds a possible next BitNode and starts with the script at the beginning.
 * Will be announce and gives a chance to stop.
 * @param {NS} ns */
async function killW0r1dD43m0n(ns) {
  if (!shouldKillWorldDaemon) return;
  const target = 'w0r1d_d43m0n';
  if (ns.getHackingLevel() > ns.getServerRequiredHackingLevel(target) && ns.singularity.getOwnedAugmentations().includes('The Red Pill')) {
    if (!crackPorts(ns, target)) {
      log(ns, `Couldn't crack ports on w0r1d_d43m0n`, 'warning', 1000 * 30);
      return;
    }
    log(ns, `Killing BITNODE in 15 seconds. Press ESC to cancel. `, 'warning', 1000 * 30);
    let counter = 16;
    while (counter-- > 0 && shouldRun) {
      ns.toast(counter, 'warning', 1000);
      await ns.sleep(1000);
    }
    if (!shouldRun) return;

    let next = findNextBitNode(ns);

    // next = next + 1;
    log(ns, `-------------------------------------------------------------------------------`, 'warning', 1000 * 1, true);
    log(ns, `Killed BITNODE ${ns.getResetInfo().currentNode} and starting next on ${next} ${timeSinceBitNodeReset(ns)}`, 'warning', 1000 * 60 * 30, true);
    LogState.reset();
    ns.singularity.destroyW0r1dD43m0n(next, 'starter.js');
    // jumpTo(ns, target);
    // await ns.singularity.installBackdoor();
    log(ns, `Killed BITNODE and starting next on ${next} `, 'warning', 1000 * 60 * 30);

    counter = 5;
    while (counter-- > 0)
      await ns.sleep(1000);

    // on some bitnodes there are descriptions which block further execution.. maybe this helps
    clickByXpath("//*[contains(text(), 'Continue ...')]");

  }
}

/** @param {NS} ns */
function expandServers(ns) {
  if (!ns.isRunning("expand_servers.js", 'home', 'noprompt') && !ns.isRunning("upgrade_servers.js", 'home'))
    if (startScript(ns, "expand_servers.js", false, 'noprompt')) ns.tprint("Started server expand loop");
}

/** @param {NS} ns */
function stopExpandingServers(ns) {
  if (ns.isRunning("expand_servers.js", 'home', 'noprompt') || ns.isRunning("upgrade_servers.js", 'home')) {
    ns.kill("upgrade_servers.js");
    ns.kill("expand_servers.js");
    log(ns, 'Stopping server upgrades', 'warning');
  }
}

/** Buys Tor and all the hacking apps
 * @param {NS} ns */
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

class Infiltration {
  /**
   * @static
   * @type {InfiltrationLocation}
   * @description This is a static property that holds a string value.
   */
  static bestInfiltration;
  /** @param {NS} ns */
  constructor(ns) {
    //Netscript environment becomes part of the instance
    this.ns = ns;
    /**
   * @type {InfiltrationLocation[]}
   * @description This is a static property that holds a string value.
   */
    this.infiInfo = this.infiltrationInfo();
    Infiltration.bestInfiltration = this.bestInfi();
  }

  /** Fetch the available infiltration that we can run and information about it: location, rewards
   * */
  infiltrationInfo() {
    let infiInfo = {}
    let infiLocations = this.ns.infiltration.getPossibleLocations();

    for (const loc in infiLocations) {
      let l = infiLocations[loc];
      infiInfo[l.name] = this.ns.infiltration.getInfiltration(l.name);
    }
    return infiInfo;
  }
  /** Will find the best Infiltration based on how much rep will it trade in for. ECorp obviously, but the values change throughout the BitNode run based on Combat multipliers of the player
   */
  bestInfi() {
    let bestCompany = null;
    let highestTradeRepValue = -Infinity;

    for (const key in this.infiInfo) {
      const company = this.infiInfo[key];
      if (company.reward.tradeRep > highestTradeRepValue) {
        highestTradeRepValue = company.reward.tradeRep;
        bestCompany = company;
      }
    }
    return bestCompany;
  }

  /** Heal and start infiltration for the given amount of time
   * TODO: break the loop if some requirement change, espacially if it has to run for 30 times
   * @param {string} target Which company should be infiltrated
   * @param {number} times How many times to run the infiltration
   * @param {string} faction Which faction the reputation reward should be traded for (optional) - if left out, trades in for money
   * 
   * Returns the avarage time taken for one infiltration run */
  async infiltrate(target, times, faction) {
    const startDate = new Date();
    if (this.ns.getPlayer().hp.current < this.ns.getPlayer().hp.max)
      this.ns.singularity.hospitalize();
    const infiPid = this.ns.exec("infi_loop.js", 'home', 1, target, times, faction, 'dontGrind');
    if (infiPid != 0)
      log(this.ns, `${target} for ${times} times infiltration started...`);
    else
      log(this.ns, " Couldn't start infiltration of " + target + " !!!", 'error');

    while (this.ns.isRunning(infiPid)) {
      await this.ns.sleep(2000);
    }
    // avarage time taken per run
    return formatDuration(timeTakenInSeconds(startDate, new Date()) / times);
  }

  /** @param {Augmentation} aug */
  async grindMoney(aug) {
    //$14.235b ECorp on BitNode 6 wihtouht combat augments
    //$14.235b with 8 fluxes... hmmmm
    //$14.235b with The Black Hand and 76 Fluxes.. so fluxes don't influence this..
    const incomePerSecond = this.ns.getTotalScriptIncome()[0];
    const secondsOfPassive = Math.ceil(aug.price / incomePerSecond);
    // if (secondsToGrind < 60)
    if (this.ns.getPlayer().skills.hacking > 6000) { // TODO change this
      log(this.ns, `Skipping infi. Waiting ${secondsOfPassive}s for ${this.ns.nFormat(aug.price, "$0.0a")} to flow in.`, 'warning', secondsOfPassive * 1000);
      while (this.ns.getPlayer().money < aug.price)
        await this.ns.sleep(200);
    }
    else {
      let pl = this.ns.getPlayer();
      if (aug.price > pl.money) {
        const moneyToGather = aug.price - pl.money;
        let grindTarget = this.infiToGrind(moneyToGather);
        const grindIncomePerSecond = grindTarget.best.reward.sellCash / 80; //time is average.. could implement some counter for how many times the loop has ran so far
        const secondsRequired = moneyToGather / (grindIncomePerSecond + incomePerSecond);
        const timesToRunWhilePassive = Math.ceil(secondsRequired / 80);
        // log(this.ns, "Time till money is gathered: " + formatDuration(secondsRequired), 'warning', 30 * 1000);

        // TODO calculate secondsPassive and time to grindInfi and run only the amount required
        // await this.grindInfiltration(aug, grindTarget.company, grindTarget.times, 'none');
        await this.grindInfiltration(aug, grindTarget.company, timesToRunWhilePassive, 'none');
      }
    }
  }

  // let repGainPer100k;
  /** This can be calculated from formulas, but the price is low so works anyhow. 
   * @param {NS} ns */
  async repPer100k(faction) {
    // rep = donation * reputation_multi/10**6
    if (this.repGainPer100k) return this.repGainPer100k;

    while (this.ns.getPlayer().money < 100000)
      await this.ns.sleep(200);
    let fRepBefore = this.ns.singularity.getFactionRep(faction);
    this.ns.singularity.donateToFaction(faction, 100000);
    let fRepAfter = this.ns.singularity.getFactionRep(faction);
    return this.repGainPer100k = (fRepAfter - fRepBefore);
  }

  /** Grinds reputation for the given augmentation 
   * @param {NS} ns */
  async grindRep(aug) {
    // fresh no combatskilled infiltration on ECorp gives 331.682k on BitNode 6
    let factionRep = this.ns.singularity.getFactionRep(aug.faction);
    if (aug.repreq > factionRep) {
      const facFavor = this.ns.singularity.getFactionFavor(aug.faction);
      if (facFavor >= this.ns.getFavorToDonate()) {

        const incomePerSecond = this.ns.getTotalScriptIncome()[0];
        const best = Infiltration.bestInfiltration;
        let repGain = await this.repPer100k(aug.faction);
        let repPerRun = best.reward.tradeRep;
        let gainFromMoneyPerRun = repGain / 100000 * best.reward.sellCash;
        let required = aug.repreq - factionRep;
        let moneyToBuyRep = required / repGain * 100000;
        const reqToMoneyRatio = this.ns.getPlayer().money / moneyToBuyRep;
        if (reqToMoneyRatio > 10 || this.ns.getPlayer().skills.hacking > 6000) {
          // if hacking high, but no money

          const secondsOfPassive = Math.ceil(moneyToBuyRep / incomePerSecond);
          if (this.ns.getPlayer().money < moneyToBuyRep)
            log(this.ns, `Waiting ${secondsOfPassive}s for ${this.ns.nFormat(moneyToBuyRep, "$0.0a")} to donate to ${aug.faction} to buy ${this.ns.nFormat(required, "$0.0a")} rep`, 'warning', secondsOfPassive * 1000);
          while (this.ns.getPlayer().money < moneyToBuyRep)
            await this.ns.sleep(200);

          if (this.ns.singularity.donateToFaction(aug.faction, moneyToBuyRep)) {
            log(this.ns, `Donated: ${this.ns.nFormat(moneyToBuyRep, "$0.0a")} to ${aug.faction} to buy ${this.ns.nFormat(required, "$0.0a")} rep`);
            return true;
          }
        }
      }

      // figure out the number of times and/or target we need to run the faction grind
      const grindTarget = this.infiToGrind(null, aug.repreq - factionRep);
      return await this.grindInfiltration(aug, grindTarget.company, grindTarget.times, aug.faction);
    }
    return true;
  }
  /** Runs Infiltration in circles, but reloads the game every 20 runs to reload attached events - they slow down execution drastically.
   * @param {NS} ns */
  async grindInfiltration(aug, company, times, faction, shouldTake = '') {
    log(this.ns, `Grinding ${faction == 'none' ? 'money' : 'rep'} on: ${company} ${times} times to buy ${aug.aug} in ${aug.faction}. Should take: ${formatDuration(times * 70)}`, 'info', 80 * 1000 * times);

    // if grind will take more than 20 runs, we want to allow it to reload.. so let's cap it, even if it will fail to buy the augmentation
    let grindCount = infiRunCount() + times >= 20 ? 20 - infiRunCount() : times;
    grindCount = grindCount < 1 ? 1 : grindCount;
    if (times > 20)
      log(this.ns, `Limiting grind count to ${grindCount}, otherwise would be ${times}`, 'warning', 15 * 1000);
    await this.infiltrate(company, grindCount, faction);

    if (infiRunCount() > 20 && shouldRun) {
      log(this.ns, 'Waiting 31s to ensure saving the game and reloading to unclog Infiltration. Press ESC to cancel...', 'warning', 30 * 1000);
      let counter = 31;
      while (counter-- > 0 && shouldRun) {
        this.ns.toast(counter, 'warning', 1000);
        await this.ns.sleep(1000)
      }
      if (shouldRun) {
        localStorage.setItem('infiRunCounter', 0);
        location.assign(location.href.replace(/\?noScripts=true$/, ''));
      }
    }
    if (times == grindCount) return true;
    return false;
  }

  // simplified totally to just go for ECorp all the time
  infiToGrind(requestedMoney, requestedReputation) {
    const cpn = Infiltration.bestInfiltration;
    let timesToWork;
    if (requestedMoney)
      timesToWork = Math.ceil(requestedMoney / cpn.reward.sellCash);
    else
      timesToWork = Math.ceil(requestedReputation / cpn.reward.tradeRep);
    return { company: cpn.location.name, times: timesToWork, best: cpn };
  }
}