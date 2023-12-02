import { log, timeSinceBitNodeReset } from 'common.js'
/** @param {NS} ns */
export async function main(ns) {

  if (ns.stanek.acceptGift()) {

    const h = ns.stanek.giftHeight();
    const w = ns.stanek.giftWidth();
    // ns.stanek.placeFragment(1, 1, 1, 0); //hack 1
    // ns.stanek.placeFragment(4, 1, 1, 1); //hack 2
    // ns.stanek.placeFragment(0, 2, 3, 5); //faster scripts
    // ns.stanek.placeFragment(1, 4, 0, 6); //hack power
    // ns.stanek.placeFragment(0, 0, 0, 101); //multi
    // ns.stanek.placeFragment(2, 1, 1, 106); //multi

    if (h == 3 && w == 2) {
    ns.stanek.placeFragment(0, 0, 1, 0);   //hack 1
    }
    
    if (h == 2 && w == 3) {
    ns.stanek.placeFragment(0, 0, 3, 1);   //hack 1
    }
    else if (h == 6 && w == 6) {
    ns.stanek.placeFragment(0, 0, 3, 0);   //hack 1
    ns.stanek.placeFragment(1, 0, 2, 1);   //hack 2
    ns.stanek.placeFragment(3, 0, 0, 5);   //faster scripts
    ns.stanek.placeFragment(4, 3, 2, 21);  //cheaper hacknet
    ns.stanek.placeFragment(0, 2, 0, 7);   //grow power
    ns.stanek.placeFragment(2, 5, 0, 6);   //hack power
    ns.stanek.placeFragment(2, 1, 2, 101); //multi
    ns.stanek.placeFragment(0, 3, 2, 101); //multi
    }
    
    else if (h == 3 && w == 4) {
    ns.stanek.placeFragment(2, 0, 1, 1);   //hack 2
    ns.stanek.placeFragment(0, 0, 0, 0);   //hack 1   
    }
    
    else if (h == 5 && w == 5) {
    ns.stanek.placeFragment(0, 0, 0, 5);   //faster scripts
    ns.stanek.placeFragment(1, 2, 0, 21);  //cheaper hacknet
    ns.stanek.placeFragment(0, 1, 1, 20);   //faster hacknet
    ns.stanek.placeFragment(2, 0, 0, 0);   //hack 1    
    ns.stanek.placeFragment(3, 1, 1, 1);   //hack 2
    ns.stanek.placeFragment(1, 3, 2, 101); //multi
    }
    else if (h == 6 && w == 7) {
      ns.stanek.placeFragment(1, 1, 3, 0);   //hack 1
      ns.stanek.placeFragment(2, 1, 2, 1);   //hack 2
      ns.stanek.placeFragment(0, 2, 3, 5);   //faster scripts
      ns.stanek.placeFragment(4, 0, 2, 21);  //cheaper hacknet
      ns.stanek.placeFragment(4, 3, 3, 7);   //grow power
      ns.stanek.placeFragment(0, 5, 2, 6);   //hack power
      ns.stanek.placeFragment(0, 0, 0, 101); //multi
      ns.stanek.placeFragment(1, 3, 2, 101); //multi
      ns.stanek.placeFragment(5, 2, 1, 101); //multi
    }
    
    else if (h == 7 && w == 8) {
      ns.stanek.placeFragment(1, 1, 3, 0);   //hack 1
      ns.stanek.placeFragment(3, 2, 1, 1);   //hack 2
      ns.stanek.placeFragment(0, 2, 3, 5);   //faster scripts
      ns.stanek.placeFragment(2, 5, 2, 21);  //cheaper hacknet
      ns.stanek.placeFragment(5, 5, 0, 7);   //grow power
      ns.stanek.placeFragment(7, 1, 3, 6);   //hack power
      ns.stanek.placeFragment(0, 0, 0, 101); //multi
      ns.stanek.placeFragment(0, 4, 0, 100); //multi
      ns.stanek.placeFragment(2, 0, 2, 102); //multi
      ns.stanek.placeFragment(4, 3, 3, 103); //multi
      ns.stanek.placeFragment(5, 0, 2, 105); //multi
      ns.stanek.placeFragment(6, 2, 3, 101); //multi
    }
    // TODOs:
    // 1. since there are diminisihing returns.. it could make sense to give up and redirect to hacking when it's slowing down too much
    // 2. when ready for Covenant or Illuminati switch the build to combat - it won't break infiltration, but will allow to reach skills faster.

    while (true) {
      await ns.sleep(50);
      const active = ns.stanek.activeFragments();
      let chargable = active.filter(f => f.id < 100);
      if (chargable.length == 0) continue;

      let stThreads = Math.floor(ramReservedForStanek() / chargable.length / ns.getScriptRam('stanek.js'));

      if (stThreads <= 0) continue;

      for (const frag of chargable) {
        ns.exec('stanek.js', 'home', stThreads, frag.x, frag.y);
      }
      buyAugs(ns);
    }
  }
}

function buyAugs(ns) {
  const f = "Church of the Machine God";
  let augs = ns.singularity.getAugmentationsFromFaction(f);
  const curRep = ns.singularity.getFactionRep(f);
  for (const aug of augs) {
    if (ns.singularity.getAugmentationRepReq(aug) <= curRep)
      if (ns.singularity.purchaseAugmentation(f, aug))
        log(ns, `Stanek augmentation ${aug} aquired. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
  }
}


function ramReservedForStanek() {
  let ram = localStorage.getItem('ramReservedForStanek');
  if (ram) return Number.parseInt(ram);
  else return 0;
}