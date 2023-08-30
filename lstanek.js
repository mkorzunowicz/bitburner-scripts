import { log } from 'common.js'
/** @param {NS} ns */
export async function main(ns) {

  if (ns.stanek.acceptGift()) {

    // ns.stanek.placeFragment(1, 1, 1, 0); //hack 1
    // ns.stanek.placeFragment(4, 1, 1, 1); //hack 2
    // ns.stanek.placeFragment(0, 2, 3, 5); //faster scripts
    // ns.stanek.placeFragment(1, 4, 0, 6); //hack power
    // ns.stanek.placeFragment(0, 0, 0, 101); //multi
    // ns.stanek.placeFragment(2, 1, 1, 106); //multi


    ns.stanek.placeFragment(0, 0, 3, 0);   //hack 1
    ns.stanek.placeFragment(1, 0, 2, 1);   //hack 2
    ns.stanek.placeFragment(3, 0, 0, 5);   //faster scripts
    ns.stanek.placeFragment(4, 3, 2, 21);  //cheaper hacknet
    ns.stanek.placeFragment(0, 2, 0, 7);   //grow power
    ns.stanek.placeFragment(2, 5, 0, 6);   //hack power
    ns.stanek.placeFragment(2, 1, 2, 101); //multi
    ns.stanek.placeFragment(0, 3, 2, 101); //multi

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
        log(ns, `Stanek augmentation ${aug} aquired`, 'success', 30 * 1000, true);
  }
}


function ramReservedForStanek() {
  let ram = localStorage.getItem('ramReservedForStanek');
  if (ram) return Number.parseInt(ram);
  else return 0;
}