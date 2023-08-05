import { log, numberOfPortsOpenable, jumpTo, recursive_scan, crackPorts } from 'common'

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
  const worthBackdooring = ['CSEC', 'avmnite-02h', 'I.I.I.I', 'run4theh111z'];
  //w0r1d_d43m0n moved to singl.js to avoid inifite infi loop
  // const worthBackdooring = ['CSEC', 'avmnite-02h', 'I.I.I.I', 'run4theh111z', 'w0r1d_d43m0n'];
  let backdoored = [];

  ns.atExit(() => {
    // console.log("WTF BACKDOOR SCRIPT ENDED")
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

/** @param {NS} ns
 * @param {string} target The server to find
*/
async function backdoor(ns, target) {
  if (ns.getServer(target).backdoorInstalled) return;

  jumpTo(ns, target);
  if (crackPorts(ns, target)) {
    log(ns, 'Attempting backdoor installation on: ' + target)

    // if (target == 'w0r1d_d43m0n') {
    //   const next = findNextBitNode(ns);
    //   log(ns, `Killed BITNODE and starting next on ${next} `, 'warning', 1000 * 60 * 30);
    //   ns.singularity.destroyW0r1dD43m0n(next, 'starter.js');
    //   log(ns, `Killed BITNODE and starting next on ${next} `, 'warning', 1000 * 60 * 30);
    // }
    // else
    await ns.singularity.installBackdoor();
    log(ns, 'Backdoored: ' + target);
  }
  else
    log(ns, 'Failed backdooring: ' + target, 'warning');

  ns.singularity.connect('home');
}
