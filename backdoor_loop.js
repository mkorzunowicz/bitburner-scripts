/** @param {NS} ns */
export async function main(ns) {
    // ns.disableLog('ALL');
    ns.disableLog('getHackingLevel');
    ns.disableLog('getServerRequiredHackingLevel');
    ns.disableLog('sleep');
    
    await backdoor_loop(ns);
  }
  /** Let's just backdoor everything we can.. cause why not ;] REQUIRES SINGULARITY!!!
   * @param {NS} ns */
  async function backdoor_loop(ns) {
    // ns.tail();
    const worthBackdooring = ['CSEC', 'avmnite-02h', 'I.I.I.I', 'run4theh111z', 'w0r1d_d43m0n'];
    let backdoored = [];
  
    ns.atExit(() => {
      console.log("WTF BACKDOOR SCRIPT ENDED")
    });
  
    let network = [];
    // debugger;
    await recursive_scan(ns, 'home', network);
    while (backdoored.length != network.length) {
      const openablePorts = numberOfPortsOpenable(ns);
  
      for (const s of network) {
        if (backdoored.includes(s) ||
          ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s) ||
          ns.getServerNumPortsRequired > openablePorts) continue;
        if (worthBackdooring.includes(s)) { // comment out to backdoor everything
          await backdoor(ns, s);
          backdoored.push(s);
        }
        let faction;
        // join hacking factions automatically - it doesn't impact anything anyway
        if (s == 'CSEC')
          faction = 'CyberSec';
        else if (s == 'avmnite-02h')
          faction = 'NiteSec';
        else if (s == 'I.I.I.I')
          faction = 'The Black Hand';
        else if (s == 'run4theh111z')
          faction = 'BitRunners';
  
        if (faction)
          if (ns.singularity.joinFaction(faction))
            log(ns, 'Joined: ' + faction);
      }
      await ns.sleep(2000);
    }
  
    ns.tprint('WARNING Finished backdooring every server!!!!');
  }
  
  /** @param {NS} ns */
  function findNextBitNode(ns) {
    let sourceFiles = ns.singularity.getOwnedSourceFiles();
    // Check if all sourceFiles are at level 3
    const allAtLevel3 = sourceFiles.every(file => file.lvl === 3);
  
    if (allAtLevel3) {
      // Find the maximum value of 'n'
      const maxN = Math.max(...sourceFiles.map(file => file.n));
  
      // Check if there is a gap in the 'n' values
      for (let i = 1; i <= maxN; i++) {
        if (!sourceFiles.some(file => file.n === i)) {
          return i; // Return the first missing 'n'
        }
      }
  
      // If all numbers from 1 to maxN are present, propose the next one
      return maxN + 1;
    } else {
      // Filter out the sourceFiles with level less than 3 and sort them in ascending order
      const availableSourceFiles = sourceFiles.filter(file => file.lvl < 3).sort((a, b) => a.lvl - b.lvl);
  
      // Find the first available sourceFile (the one with the lowest level)
      const nextSourceFile = availableSourceFiles[0];
  
      // Return the number 'n' of the next sourceFile
      return nextSourceFile.n;
    }
  }
  /** @param {NS} ns
   * @param {string} target The server to find
  */
  async function backdoor(ns, target) {
    if (ns.getServer(target).backdoorInstalled) return;
  
    let visited = [];
    let path = recursive_lookup(ns, 'home', visited, target);
    if (path instanceof (Array)) {
      path.reverse();
      for (const p of path) {
        ns.singularity.connect(p);
      }
    }
    if (crackPorts(ns, target)) {
      log(ns, 'Attempting backdoor installation on: ' + target)
  
      if (target == 'w0r1d_d43m0n')
        ns.singularity.destroyW0r1dD43m0n(findNextBitNode(ns), 'starter.js');
      else
        await ns.singularity.installBackdoor();
      log(ns, 'Backdoored: ' + target);
    }
    else
      log(ns, 'Failed backdooring: ' + target, 'warning');
  
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
  
  /** @param {NS} ns */
  function log(ns, msg, type = 'info', time = 15000) {
    console.log(msg);
    ns.toast(msg, type, time);
    if (type == 'info' || type == 'success')
      ns.tprint(msg);
    else
      ns.tprint(type.toUpperCase() + ": " + msg);
  }