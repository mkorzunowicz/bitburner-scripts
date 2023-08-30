import { log, hasSingularity, hashacknetServers } from 'common.js'
import { Servers } from 'ultimate_spread.js'

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.disableLog("sleep");

  while (true) {
    upgradeHomeServer(ns);
    upgradeHacknetServers(ns);
    purchaseServers(ns);
    upgradePurchasedServers(ns);

    await ns.sleep(1000);
  }
}

function purchaseServers(ns) {
  const ram = 8;
  const purchased = ns.getPurchasedServers();

  let i = purchased.length;
  if (purchased.length < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer("pserv-" + i, ram);
      if (hostname) {
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
      let moneyAvailable = ns.getServerMoneyAvailable("home");
      while (ns.getPurchasedServerUpgradeCost(serv, newRam) > moneyAvailable && newRam > ram) {
        newRam /= 2;
      }
      if (newRam <= ram) continue;

      let cost = ns.getPurchasedServerUpgradeCost(serv, newRam);

      if (ns.getServerMoneyAvailable("home") > cost) {
        ns.upgradePurchasedServer(serv, newRam);
        // log(ns, "Upgraded " + serv + " to: " + newRam + "GB for " + ns.nFormat(cost, "$0.000a"), 'success', 3000);
        log(ns, `Upgraded ${serv} to: ${ns.formatRam(newRam)} for ${ns.nFormat(cost, "$0.000a")}`, 'success', 3000);
      }
    }
  }
}

function upgradeHomeServer(ns) {
  if (!hasSingularity(ns)) return;

  let h = ns.getServer('home');
  let homeCoresCost = ns.singularity.getUpgradeHomeCoresCost();
  let homeRamCost = ns.singularity.getUpgradeHomeRamCost();
  if (ns.getServerMoneyAvailable("home") > homeCoresCost) {
    if (ns.singularity.upgradeHomeCores())
      log(ns, `Upgraded home cores to ${h.cpuCores + 1} for ${ns.nFormat(homeCoresCost, "$0.000a")}`, 'success', 15 * 1000, true);
  }
  if (ns.getServerMoneyAvailable("home") > homeRamCost) {
    if (ns.singularity.upgradeHomeRam())
      // log(ns, `Upgraded home ram to ${h.maxRam * 2}GB for ${ns.nFormat(homeRamCost, "$0.000a")}`, 'success', 30 * 1000, true);
      log(ns, `Upgraded home ram to ${ns.formatRam(h.maxRam * 2)} for ${ns.nFormat(homeRamCost, "$0.000a")}`, 'success', 15 * 1000, true);
  }
}

function upgradeHacknetServers(ns) {
  if (!hashacknetServers(ns)) return;

  const servers = new Servers(ns, "hacknet", true);
  if (servers.allServers.length < 20) {
    let cost = ns.hacknet.getPurchaseNodeCost();
    if (ns.getServerMoneyAvailable("home") > cost)
      if (ns.hacknet.purchaseNode())
        log(ns, `Bought hacknet ${servers.allServers.length} for ${ns.nFormat(cost, "$0.000a")}`, 'success', 15 * 1000, false);
  }
  for (let i = 0; i < servers.allServers.length; i++) {
    let coresCost = ns.hacknet.getCoreUpgradeCost(i);
    if (ns.getServerMoneyAvailable("home") > coresCost)
      if (ns.hacknet.upgradeCore(i))
        log(ns, `Upgraded hacknet ${i} for ${ns.nFormat(coresCost, "$0.000a")}`, 'success', 15 * 1000, false);

    let ramCost = ns.hacknet.getRamUpgradeCost(i);
    if (ns.getServerMoneyAvailable("home") > ramCost)
      if (ns.hacknet.upgradeRam(i))
        log(ns, `Upgraded hacknet ${i} ram to for ${ns.nFormat(ramCost, "$0.000a")}`, 'success', 15 * 1000, false);
  }
}