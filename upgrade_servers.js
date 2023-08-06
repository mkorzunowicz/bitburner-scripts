/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.disableLog("sleep");

  const purchasedServermax = ns.getPurchasedServerMaxRam();
  const purchased = ns.getPurchasedServers();
  if (purchased.every((server) => { return ns.getServerMaxRam(server) == purchasedServermax; })) {
    // log(ns, "All purchased servers fully upgraded. Exiting.", 'success', 5000);
    return;
  };
  while (true) {
    for (let i = 0; i < purchased.length; ++i) {
      const serv = purchased[i];

      const ram = ns.getServerMaxRam(serv);
      if (purchasedServermax > ram) {
        let newRam = ram * 2;
        let moneyAvailable = ns.getServerMoneyAvailable("home");
        while (ns.getPurchasedServerUpgradeCost(serv, newRam) < moneyAvailable) {
          if (purchasedServermax >= newRam * 2)
            newRam = newRam * 2;
          else break;
        }
        let cost = ns.getPurchasedServerUpgradeCost(serv, newRam);
        if (ns.getServerMoneyAvailable("home") > cost) {
          ns.upgradePurchasedServer(serv, newRam);
          log(ns, "Upgraded " + serv + " to: " + newRam + "GB for " + ns.nFormat(cost, "$0.000a"), 'success', 3000);
        }
      }
    }
    if (purchased.every((server) => { return ns.getServerMaxRam(server) == purchasedServermax; })) {
      log(ns, "All purchased servers fully upgraded. Exiting.", 'success', 5000);
      return;
    };
    await ns.sleep(1000);
  }
}

/** @param {NS} ns */
function log(ns, msg, type = 'info', time = 15000) {
  console.log(msg);
  ns.toast(msg, type, time);
  if (type == 'info' || type == 'success')
    ns.tprint(msg);
  else
    ns.tprint(type.toUpperCase() + ": " + msg);
}