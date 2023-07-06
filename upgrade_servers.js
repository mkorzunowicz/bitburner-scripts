/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.disableLog("sleep");

  const purchasedServermax = ns.getPurchasedServerMaxRam();
  const purchased = ns.getPurchasedServers();
  while (true) {
    for (let i = 0; i < purchased.length; ++i) {
      const serv = purchased[i];

      const ram = ns.getServerMaxRam(serv);
      // ns.tprint("Ram on " + serv + " = " + ram + " max: " + purchasedServermax);
      if (purchasedServermax > ram) {
        let newRam = ram * 2;
        let cost = ns.getPurchasedServerUpgradeCost(serv, newRam);
        if (ns.getServerMoneyAvailable("home") > cost) {

          ns.upgradePurchasedServer(serv, newRam);
          let msg = "Upgraded " + serv + " to: " + newRam + "GB for " + ns.nFormat(cost, "$0.000a");
          // let cst = cost.format('$0.000a');

          // let cst = Intl.format(cost,'$0.000a');
          // let msg = "Upgraded " + serv + " to: " + newRam + "GB for " + ns.formatNumber(cost,"$0.000a");
          // let msg = "Upgraded " + serv + " to: " + newRam + "GB for " + cst;
          ns.tprint(msg);
          // ns.toast(msg);
          ns.print(msg);
        }
      }
    }
    if (purchased.every((server) => { return ns.getServerMaxRam(server) == purchasedServermax; })) {
      let msg = "All purchased servers fully upgraded. Exiting.";
      ns.tprint(msg);
      ns.toast(msg);
      return;
    };
    await ns.sleep(1000);
  }
}
