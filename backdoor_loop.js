/** @param {NS} ns */
export async function main(ns) {
    await backdoor_loop(ns);
  }
  
  /** Let's just backdoor everything we can.. cause why not ;] 
   * @param {NS} ns */
  async function backdoor_loop(ns) {
    let backdoored = [];
  
    let network = [];
    await recursive_scan(ns, 'home', network);
    while (backdoored.length != network.length) {
      const openablePorts = numberOfPortsOpenable(ns);
  
      for (const s of network) {
        if (backdoored.includes(s) ||
          ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s) ||
          ns.getServerNumPortsRequired > openablePorts) continue;
        await backdoor(ns, s);
        // join hacking factions automatically - it doesn't impact anything anyway
        if (s == 'CSEC')
          ns.singularity.joinFaction('CyberSec');
        if (s == 'avmnite-02h')
          ns.singularity.joinFaction('NiteSec');
        if (s == 'I.I.I.I')
          ns.singularity.joinFaction('The Black Hand');
        if (s == 'run4theh111z')
          ns.singularity.joinFaction('BitRunners');
      }
      await ns.sleep(2000);
    }
    
    ns.tprint('WARNING Finished backdooring every server!!!!');
  }
  
  /** @param {NS} ns
   * @param {string} target The server to find
  */
  async function backdoor(ns, target) {
    if (ns.getServer(target).backdoorInstalled) return;
  
    let visited = [];
    let path = recursive_lookup(ns, 'home', visited, target);
    if (path instanceof (Array)) {
      ns.tprint(path.reverse());
      for (const p of path) {
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
          if (!path.includes(serv2))
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
  
  /** @param {NS} ns */
  export function numberOfPortsOpenable(ns) {
    let count = 0;
    if (ns.fileExists('BruteSSH.exe', 'home'))
      count++;
    if (ns.fileExists('FTPCrack.exe', 'home'))
      count++;
    if (ns.fileExists('relaySMTP.exe', 'home'))
      count++;
    if (ns.fileExists('HTTPWorm.exe', 'home'))
      count++;
    if (ns.fileExists('SQLInject.exe', 'home'))
      count++;
    return count;
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
  
  