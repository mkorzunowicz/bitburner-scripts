/** @param {NS} ns */
export async function main(ns) {
  const ram = 8;
  const shouldStart = await ns.prompt("The automated server expansion will start if you press YES. This will spend your money. Press NO if you're saving for sth.")
  if (!shouldStart) {
    ns.tprint('NO pressed. Not expanding servers. Exiting..')
    return;
  };
  ns.tprint('YES pressed. Expanding servers...')
  // ns.tprint("Waiting 10 seconds, before expanding.. kill the script if you value your money");
  // await ns.sleep(10000);
  const purchased = ns.getPurchasedServers();
  // Iterator we'll use for our loop
  let i = purchased.length;
  // if (ns.getHackingLevel == 1)
  //   ns.singularity.universityCourse('rothman university', 'Algorithms course');

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      // If we have enough money, then:
      //  1. Purchase the server
      let hostname = ns.purchaseServer("pserv-" + i, ram);
      if (hostname) {
        ns.tprint("Bought a new server: " + hostname);
        // ns.toast("Bought a new server: " + hostname);
      }
      ++i;
    }
    //Make the script wait for a second before looping again.
    //Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(300);
  }

  const msg = "All servers bought, starting to upgrade";
  ns.tprint(msg);
  ns.toast(msg);

  ns.exec("upgrade_servers.js", 'home');
}