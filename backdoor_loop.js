import { log, numberOfPortsOpenable, recursive_lookup, recursive_scan, crackPorts } from 'common.js'

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

  let path = recursive_lookup(ns, 'home', target);
  if (path instanceof (Array)) {
    path.reverse();
    for (const p of path) {
      ns.singularity.connect(p);
    }
  }
  if (crackPorts(ns, target)) {
    log(ns, 'Attempting backdoor installation on: ' + target)

    if (target == 'w0r1d_d43m0n') {
      const next = findNextBitNode(ns);
      log(ns, `Killed BITNODE and starting next on ${next} `, 'warning', 1000 * 60 * 30);
      ns.singularity.destroyW0r1dD43m0n(next, 'starter.js');
      log(ns, `Killed BITNODE and starting next on ${next} `, 'warning', 1000 * 60 * 30);
    }
    else
      await ns.singularity.installBackdoor();
    log(ns, 'Backdoored: ' + target);
  }
  else
    log(ns, 'Failed backdooring: ' + target, 'warning');

  ns.singularity.connect('home');
}
