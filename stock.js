/** @param {NS} ns */
export async function main(ns) {
//WIP
  const stockTarget = 'FNS';
  const serverTarget = 'foodnstuff'

  /**
   * 0. for now i can only long?
   * 1. we want to check the trend - if forecast says goes up
   * 2. buy stock at a price..
   * 3. make it grow.. need to verify if it can grow also if the money is at max.. or if it changes the trend
   * 4. sell when it grows enough (we could now short)
   * 5. hack and hack until it goes down.. 
   * 3.
   */
  let askPrice;
  while (true) {
    if (ns.stock.hasTIXAPIAccess)
    {
      askPrice = ns.stock.getAskPrice(stockTarget);
    let trend = ns.stock.getForecast(stockTarget);
    }
    let max = ns.stock.getMaxShares(stockTarget);
    ns.stock.buyStock(stockTarget, 5);
    ns.tprint(stockTarget + ": AskPrice: " + askPrice + " Trend: " + trend + " Max: " + max);

    ns.hackAnalyzeChance(serverTarget);
    // Defines how much money a server should have before we hack it
    // In this case, it is set to 65% of the server's max money
    const moneyThresh = ns.getServerMaxMoney(serverTarget) * 0.65;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel(serverTarget) + 5;



    if (ns.getServerSecurityLevel(serverTarget) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      await ns.weaken(serverTarget);
    }
    // else if (ns.getServerMoneyAvailable(serverTarget) < moneyThresh) {
    //   // If the server's money is less than our threshold, grow it
    //   await ns.grow(serverTarget);
    // }
    else {
      // Otherwise, hack it
      await ns.hack(serverTarget);
    }

    ns.tprint(stockTarget + ": AskPrice: " + askPrice + " Trend: " + trend + " Max: " + max);
    await ns.sleep(3000);
  }
}