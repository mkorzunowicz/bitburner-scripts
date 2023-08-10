import { log, LogState, timeSinceBitNodeReset } from 'common.js'

/** @param {NS} ns */
export async function main(ns) {
  // it should take 18 hours 30 minutes for the Sleeves to recover
  const homicideCombatLevel = 35;
  const speakersCombatLevel = 300;
  const covenantCombatLevel = 850;
  const illuminatiCombatLevel = 1200;

  // NOTE: I need the sleeves for Homicide and then Combat skills grind.. not sure it's necessary
  // after about 5 hours with 75 we can train to 30 with homicide rate of 16%, with 8 sleeves that
  // should double the normal homicide grind speed
  const shockTreshold = 75;
  let sleevesDictionary = Object.fromEntries(Array.from({ length: ns.sleeve.getNumSleeves() }, (_, index) => [index, ns.sleeve.getSleeve(index)]));
  let shouldRun = true;
  // let ags = ns.sleeve.getSleevePurchasableAugs('2');

  // let augs = ns.singularity.getAugmentationsFromFaction('Illuminati');

  while (shouldRun) {
    for (let s in sleevesDictionary) {
      let sl = sleevesDictionary[s];
      // wait for shock to fall
      if (sl.shock <= shockTreshold) {
        if (LogState.shockTresholdFirstTime) {
          log(ns, `Sleeve shock treshold ${shockTreshold} reached. Starting homicide workout. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
          LogState.shockTresholdFirstTime = false;
        }
        if (LogState.shockZeroFirstTime && sl.shock == 0) {
          log(ns, `Sleeve shock zeroed. Buying augs. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
          LogState.shockZeroFirstTime = false;
        }
        buyAugs(ns, s, sl);

        if (ns.heart.break() < -54000) {
          // gang in - grind combat for covenant and illuminati on player
          let me = ns.getPlayer();
          if (me.numPeopleKilled < 30)
            homi(ns, s);
          else if (!combatLevelReached(me, speakersCombatLevel))
            workout(ns, s, sl, speakersCombatLevel, me);
          else if (!combatLevelReached(me, covenantCombatLevel))
            workout(ns, s, sl, covenantCombatLevel, me);
          // else if (!combatLevelReached(me, illuminatiCombatLevel))
          //   workout(ns, s, sl, illuminatiCombatLevel, me);
          else study(ns, s, sl, ns.getBitNodeMultipliers().WorldDaemonDifficulty * 3000, me);

        }
        // no gang, grind homicide.. 
        else if (combatLevelReached(sl, homicideCombatLevel)) {
          if (LogState.sleeveHomicideFirstTime) {
            log(ns, `Sleeves reached combat skills ${homicideCombatLevel}. Starting homicide. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
            LogState.sleeveHomicideFirstTime = false;
          }
          homi(ns, s);
        }
        else workout(ns, s, sl, homicideCombatLevel);
      }
      else {
        if (ns.sleeve.getTask(s).type != 'RECOVERY')
          ns.sleeve.setToShockRecovery(s);
      }
    }
    await ns.sleep(1000);

    sleevesDictionary = Object.fromEntries(Array.from({ length: ns.sleeve.getNumSleeves() }, (_, index) => [index, ns.sleeve.getSleeve(index)]));
  }
}
/** @param {NS} ns */
function buyAugs(ns, s, sl) {
  if (sl.shock != 0) return;
  // NOTE: if we start homicide before sleeves are on 0 shock and it manages to reach -54k karma before sleeves are zeroed, it makes no sense to spend the money
  // they are all targeting combat skills to increase homicide rate, by the time sleeve are brought to 0 Shock, we should be making plenty of money
  // ns.sleeve.purchaseSleeveAug(s, 'Neurotrainer I'); //$4.000m
  // ns.sleeve.purchaseSleeveAug(s, 'Neurotrainer II'); //$45.000m
  // ns.sleeve.purchaseSleeveAug(s, 'HemoRecirculator'); //$45.000m
  // ns.sleeve.purchaseSleeveAug(s, 'NutriGen Implant'); //$2.500m
  // ns.sleeve.purchaseSleeveAug(s, 'Power Recirculation Core'); //$180.000m
  // ns.sleeve.purchaseSleeveAug(s, 'Neurotrainer III'); //$130.000m
  // ns.sleeve.purchaseSleeveAug(s, 'Xanipher'); //$4.250b
  // ns.sleeve.purchaseSleeveAug(s, 'Bionic Spine'); //$125.000m
  // ns.sleeve.purchaseSleeveAug(s, 'Graphene Bionic Spine Upgrade'); //$6.000b
  // ns.sleeve.purchaseSleeveAug(s, 'CordiARC Fusion Reactor'); //$5.000b
}

/** @param {SleevePerson} sl */
function combatLevelReached(sl, level) {
  return sl.skills.strength >= level && sl.skills.defense >= level && sl.skills.dexterity >= level && sl.skills.agility >= level;
}
/** @param {NS} ns */
function homi(ns, s) {
  if (!ns.sleeve.getTask(s) || (ns.sleeve.getTask(s).type != 'CRIME' && ns.sleeve.getTask(s).crimeType != 'Homicide'))
    ns.sleeve.setToCommitCrime(s, 'Homicide');
}

/** only one sleeve can work at a company/faction at a time, which sucks 
 * @param {NS} ns */
function fieldWork(ns, s, faction) {
  if (!ns.sleeve.getTask(s) || (ns.sleeve.getTask(s).type != "FACTION" && ns.sleeve.getTask(s).factionWorkType != 'field'))
    ns.sleeve.setToFactionWork(s, faction, 'field');
}
/** @param {NS} ns 
@param {SleevePerson} sl */
function workout(ns, s, sl, level, me) {
  if (sl.city != 'Sector-12')
    ns.sleeve.travel(s, 'Sector-12');
  if (me) sl = me;
  if (sl.skills.strength < level) {
    ns.sleeve.setToGymWorkout(s, 'Powerhouse Gym', 'Strength');
    return;
  }
  else if (sl.skills.defense < level) {
    ns.sleeve.setToGymWorkout(s, 'Powerhouse Gym', 'Defense'); return;
  }
  else if (sl.skills.dexterity < level) {
    ns.sleeve.setToGymWorkout(s, 'Powerhouse Gym', 'Dexterity'); return;
  }

  else if (sl.skills.agility < level) {
    ns.sleeve.setToGymWorkout(s, 'Powerhouse Gym', 'Agility'); return;
  }
}

/** @param {NS} ns 
@param {SleevePerson} sl */
function study(ns, s, sl, level, me) {
  if (me.skills.hacking < level) {
    if (sl.city != 'Volhaven')
      ns.sleeve.travel(s, 'Volhaven');
    if (!ns.sleeve.getTask(s) || ns.sleeve.getTask(s).type != 'CLASS' || ns.sleeve.getTask(s).classType != 'Algorithms')
      ns.sleeve.setToUniversityCourse(s, 'ZB Institute of Technology', 'Algorithms');
  }

}
