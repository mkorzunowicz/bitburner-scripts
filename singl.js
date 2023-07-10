/** @param {NS} ns */
export async function main(ns) {
    // co ja tu mogę chcieć?
    // 1. na początku po złamaniu BitNode'a albo od augmentacji zaczynamy z uniwerkiem
    // 2. mozna to do ulti spreada dodać żeby uruchomił, albo lepiej niech to uruchomi ulti spread
    // 3. mozna dodać rozwój home'a o ram do jakichś 15b
    // 4. można potem napierdzielać jakąś pracę w frakcji (Sector-12, Security work) żeby dobić do ~50 statsów żeby zacząć homicidey (moż da się sprawdzić ile jest ) - klepać karmę do 54000 dla gangusów
    // 5. jak już będzie 54000 to założyć gang - dalej automatyzacja gangowa, ale przede wszystkim mamy dostęp do wielu augmentacji
    // 6. założyć corpo?
  
    let pl = ns.getPlayer();
  
    debugger;
  
    // Augmentations get installed in bulk of 10
    let runNumber = ns.singularity.getOwnedAugmentations().length % 10;
  
    //  this shouldn't be really needed - this script must be executed at the very beginning after restart
    if (pl.playtimeSinceLastAug < 100) {
  
      const autoinfiPid = ns.exec("infi.js", 'home');
      if (autoinfiPid != 0)
        ns.tprint("Infiltration automated.");
  
      const spreadPid = ns.exec("ultimate_spread.js", 'home');
      if (spreadPid != 0)
        ns.tprint("Spreading...");
      ns.singularity.universityCourse('rothman university', 'Algorithms course', false);
      // możemy uruchomić raz infiltrację na MegaCorp żeby zrobić trochę hajsu
      const infiPid = ns.exec("infi_loop.js", 'home', 1, 'MegaCorp', 1);
      if (infiPid != 0)
        ns.tprint("Initial MegaCorp infiltration started.");
  
      while (ns.isRunning(infiPid)) {
        await ns.sleep(2000);
      }
      ns.tprint("Initial MegaCorp infiltration ended.");
  
      ns.singularity.joinFaction('Shadows of Anarchy');
  
      ns.singularity.purchaseTor();
      ns.singularity.purchaseProgram('BruteSSH.exe');
      ns.singularity.purchaseProgram('FTPCrack.exe');
      ns.singularity.purchaseProgram('relaySMTP.exe');
      ns.singularity.purchaseProgram('HTTPWorm.exe');
      ns.singularity.purchaseProgram('SQLInject.exe');
  
      ns.tprint("Tor and hack programs purchased");
      ns.singularity.travelToCity('Aevum');
  
      const expandPid = ns.exec("expand_servers.js", 'home', 'noprompt');
      if (expandPid != 0)
        ns.tprint("Started server expand loop");
  
      if (runNumber == 0)
      {
        const infiPid = ns.exec("infi_loop.js", 'home', 1, 'MegaCorp', 1);
      if (infiPid != 0)
        ns.tprint("Initial MegaCorp infiltration started.");
  
      }
      //  this must be installed asap so that infiltration is more profitable
      ns.singularity.purchaseAugmentation('Shadows of Anarchy', 'SoA - phyzical WKS harmonizer');
    }
  
    ns.singularity.joinFaction('Sector-12');
  
    let homiStats = ns.singularity.getCrimeStats('Homicide');
    // ok so now we need to grind some factions, then some rep for them, then grind money and buy the augments
  
  
    // cool but doesn't need singularity and belongs to infi_loop in fact..
    let infi_info = {}
    let infi_locations = ns.infiltration.getPossibleLocations();
  
    for (const loc in infi_locations) {
      let l = infi_locations[loc];
      // debugger;
      infi_info[l.name] = ns.infiltration.getInfiltration(l.name);
    }
  
    // ns.singularity.manualHack()
  
  
    // here we could have some fancy loop which would hack and backdoor everything it can.. this should in fact be a loop running on a side imho, maybe an external script?
  
  
    debugger;
  
    let invites = ns.singularity.checkFactionInvitations();
  
    // join faction
    let player = ns.getPlayer();
    // ns.singularity.travelToCity('')
    // ns.singularity.commitCrime('Homicide');
  
  
  }
  
  /** @param {NS} ns */
  async function backdoor_loop(ns) {
    let backdoored = [];
  
    let network = [];
    await recursive_scan(ns, 'home', network);
    while (backdoored.length != visited) {
      for (const s in network) {
        if (backdoor.includes(s) || ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s)) continue;
        await backdoor(s);
      }
      await ns.sleep(2000);
    }
  }
  
  
  /** @param {NS} ns
   * @param {string} target The server to find
  */
  async function backdoor(ns, target) {
    let visited = [];
    let path = recursive_lookup(ns, 'home', visited, target);
    if (path instanceof (Array)) {
      ns.tprint(path.reverse());
      for (const p in path) {
        ns.singularity.connect(p);
      }
    }
    crackPorts(ns, target)
    await ns.singularity.installBackdoor();
    ns.tprint('Backdoored: ' + target);
  
    ns.singularity.connect('home');
  }
  
  /** @param {NS} ns
   * @param {string} serv Server to search through
   * @param {Array<string>} visited Already visited servers
   * @param {string} target The server to find
  */
  function recursive_lookup(ns, serv, visited, target) {
    visited.push(serv);
    if (serv === target) {
      return [serv];
    }
    for (const serv2 of ns.scan(serv)) {
      if (!visited.includes(serv2)) {
        const path = recursive_lookup(ns, serv2, visited, target);
        if (Array.isArray(path)) {
          path.push(serv2);
          return path;
        }
      }
    }
  }
  
  /** @param {NS} ns
   *  @param {String} target
  */
  export async function crackPorts(ns, target) {
    try {
      if (ns.fileExists('BruteSSH.exe', 'home'))
        ns.brutessh(target);
      if (ns.fileExists('FTPCrack.exe', 'home'))
        ns.ftpcrack(target);
      if (ns.fileExists('relaySMTP.exe', 'home'))
        ns.relaysmtp(target);
      if (ns.fileExists('HTTPWorm.exe', 'home'))
        ns.httpworm(target);
      if (ns.fileExists('SQLInject.exe', 'home'))
        ns.sqlinject(target);
      ns.nuke(target);
      return true;
    }
    catch {
      // most probably ports not open
      return false;
    }
  }
  
  /** Maps the network and populates the 'visited' array with network names including 'home' and purchased servers
   *  @param {NS} ns 
   * @param {string} serv Server to search through
   * @param {Array<string>} visited Already visited servers array which gets populated as output
  */
  export async function recursive_scan(ns, serv, visited) {
    visited.push(serv);
  
    for (const serv2 of ns.scan(serv)) {
      if (!visited.includes(serv2)) {
        await recursive_scan(ns, serv2, visited);
      }
    }
  }
  
  
  
  let factions = [
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