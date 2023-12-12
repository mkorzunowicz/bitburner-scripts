import { log, hasSingularity, hashacknetServers } from 'common.js'
import { Servers } from 'ultimate_spread.js'
import { getConfiguration } from 'helpers.js'

const reserve = 200_000;
let quiet = true;


const argsSchema = [
  ['upgradeFullHacknet', false],
  ['noHomeUpgrades', false],
  ['quiet', true],

];
export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}
let runOptions;


/** @param {NS} ns */
export async function main(ns) {

  runOptions = getConfiguration(ns, argsSchema);

  if (runOptions.loopMorale) {
    while (shouldRun) {
      await bumpMoraleAndEnergy(ns);
      await ns.sleep(5000);
    }
    return;
  }
  ns.disableLog("ALL");
  ns.disableLog("sleep");

  while (true) {
    upgradeHomeServer(ns);
    upgradeHacknetServers(ns);
    purchaseServers(ns);
    upgradePurchasedServers(ns);

    await ns.sleep(100);
  }
}
function available(ns) {
  return ns.getServerMoneyAvailable("home") - reserve;
}
function purchaseServers(ns) {
  const ram = 8;
  const purchased = ns.getPurchasedServers();

  let i = purchased.length;
  if (purchased.length < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (available(ns) > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer("pserv-" + i, ram);
      if (hostname) {
        if (!quiet)
          log(ns, "Bought a new server: " + hostname, 'success', 3000);
      }
    }
  }
}

function upgradePurchasedServers(ns) {
  const purchasedServermax = ns.getPurchasedServerMaxRam();
  const purchased = ns.getPurchasedServers();
  for (let i = 0; i < purchased.length; ++i) {
    const serv = purchased[i];

    const ram = ns.getServerMaxRam(serv);
    if (purchasedServermax > ram) {
      let newRam = purchasedServermax;
      let moneyAvailable = available(ns);
      while (ns.getPurchasedServerUpgradeCost(serv, newRam) > moneyAvailable && newRam > ram) {
        newRam /= 2;
      }
      if (newRam <= ram) continue;

      let cost = ns.getPurchasedServerUpgradeCost(serv, newRam);

      if (available(ns) > cost) {
        ns.upgradePurchasedServer(serv, newRam);
        if (!quiet)
          // log(ns, "Upgraded " + serv + " to: " + newRam + "GB for " + ns.nFormat(cost, "$0.000a"), 'success', 3000);
          log(ns, `Upgraded ${serv} to: ${ns.formatRam(newRam)} for ${ns.nFormat(cost, "$0.000a")}`, 'success', 3000);
      }
    }
  }
}

function upgradeHomeServer(ns) {
  if (!hasSingularity(ns)) return;
  if (runOptions.noHomeUpgrades) return;

  let h = ns.getServer('home');
  let homeCoresCost = ns.singularity.getUpgradeHomeCoresCost();
  let homeRamCost = ns.singularity.getUpgradeHomeRamCost();
  if (available(ns) > homeCoresCost) {
    if (ns.singularity.upgradeHomeCores())
      if (!quiet)
        log(ns, `Upgraded home cores to ${h.cpuCores + 1} for ${ns.nFormat(homeCoresCost, "$0.000a")}`, 'success', 15 * 1000, true);
  }
  if (available(ns) > homeRamCost) {
    if (ns.singularity.upgradeHomeRam())
      // log(ns, `Upgraded home ram to ${h.maxRam * 2}GB for ${ns.nFormat(homeRamCost, "$0.000a")}`, 'success', 30 * 1000, true);
      if (!quiet)
        log(ns, `Upgraded home ram to ${ns.formatRam(h.maxRam * 2)} for ${ns.nFormat(homeRamCost, "$0.000a")}`, 'success', 15 * 1000, true);
  }
}

/** @param {NS} ns */
function upgradeHacknetServers(ns) {
  if (!hashacknetServers(ns)) return;

  const servers = new Servers(ns, "hacknet", true);
  if (servers.allServers.length < 20) {
    let cost = ns.hacknet.getPurchaseNodeCost();
    if (available(ns) > cost)
      if (ns.hacknet.purchaseNode())
        if (!quiet)
          log(ns, `Bought hacknet ${servers.allServers.length} for ${ns.nFormat(cost, "$0.000a")}`, 'success', 15 * 1000, false);
  }
  for (let i = 0; i < servers.allServers.length; i++) {
    let coresCost = ns.hacknet.getCoreUpgradeCost(i);
    if (available(ns) > coresCost)
      if (ns.hacknet.upgradeCore(i))
        if (!quiet)
          log(ns, `Upgraded hacknet ${i} for ${ns.nFormat(coresCost, "$0.000a")}`, 'success', 15 * 1000, false);

    let ramCost = ns.hacknet.getRamUpgradeCost(i);
    if (available(ns) > ramCost)
      if (ns.hacknet.upgradeRam(i))
        if (!quiet)
          log(ns, `Upgraded hacknet ${i} ram to for ${ns.nFormat(ramCost, "$0.000a")}`, 'success', 15 * 1000, false);

    if (ns.scriptRunning('zcorp.js', 'home') || runOptions.upgradeFullHacknet) {
      let cacheCost = ns.hacknet.getCacheUpgradeCost(i);
      if (available(ns) > cacheCost)
        if (ns.hacknet.upgradeCache(i))
          if (!quiet)
            log(ns, `Upgraded hacknet cache ${i} for ${ns.nFormat(cacheCost, "$0.000a")}`, 'success', 15 * 1000, false);

      let levelCost = ns.hacknet.getLevelUpgradeCost(i);
      if (available(ns) > levelCost)
        if (ns.hacknet.upgradeLevel(i))
          if (!quiet)
            log(ns, `Upgraded hacknet level ${i} for ${ns.nFormat(levelCost, "$0.000a")}`, 'success', 15 * 1000, false);
    }
  }
}