/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  // let factionToGrind = ns.args[0];

  await university(ns);
  // await securityWork(ns);
  await gym(ns);
  await commiteHomicide(ns);

  await waitToStartGang(ns);


  if (ns.gang.createGang('Slum Snakes'))
    log(ns, 'Starting gang at Slum Snakes', 'success');
  else
    log(ns, "Couldn't start a gang");
}

/** @param {NS} ns */
async function university(ns) {
  if (s.getPlayer().skills.hacking < 300) {
    ns.singularity.travelToCity('Sector-12');
    if (ns.singularity.universityCourse('Rothman University', 'Algorithms course', false))
      log(ns, "Starting Alghoritms course");
    else
      log(ns, "Couldn't start learning Algorithms !!!", 'error');

    while (ns.getPlayer().skills.hacking < 300)
      await ns.sleep(2000);
  }
}

/** @param {NS} ns */
async function gym(ns) {
  ns.singularity.travelToCity('Sector-12');
  ns.singularity.gymWorkout('Powerhouse Gym', 'strength', false)
  while (ns.getPlayer().skills.strength < 80)
    await ns.sleep(2000);

  ns.singularity.travelToCity('Sector-12');
  ns.singularity.gymWorkout('Powerhouse Gym', 'defense', false)
  while (ns.getPlayer().skills.defense < 80)
    await ns.sleep(2000);
  ns.singularity.travelToCity('Sector-12');
  ns.singularity.gymWorkout('Powerhouse Gym', 'dexterity', false)
  while (ns.getPlayer().skills.dexterity < 80)
    await ns.sleep(2000);
  ns.singularity.travelToCity('Sector-12');
  ns.singularity.gymWorkout('Powerhouse Gym', 'agility', false)
  while (ns.getPlayer().skills.agility < 80)
    await ns.sleep(2000);

}
/** @param {NS} ns */
async function securityWork(ns) {
  let factions = ns.getPlayer().factions;
  while (!factions.includes('Sector-12') && !factions.includes('Volhaven') && !factions.includes('New Tokyo')) {
    factions = ns.getPlayer().factions;
    await ns.sleep(2000);
  }

  log(ns, 'Starting security work');
  if (factions.includes('Sector-12'))
    ns.singularity.workForFaction('Sector-12', 'security', false);
  else if (factions.includes('Volhaven'))
    ns.singularity.workForFaction('Volhaven', 'security', false);
  else if (factions.includes('New Tokyo'))
    ns.singularity.workForFaction('New Tokyo', 'security', false);

  // let's train combat till homicide is 90% - that's about 100 on each combat skill
  while (ns.singularity.getCrimeChance('Homicide') < 0.9) {
    await ns.sleep(2000);
  }
}

/** @param {NS} ns */
async function commiteHomicide(ns) {
  // grind karma with homicide
  ns.singularity.commitCrime('Homicide', false);
}


/** @param {NS} ns */
async function waitToStartGang(ns) {
  // required karma to start a gang is -54000
  while (ns.heart.break() > -54000)
    await ns.sleep(2000);

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