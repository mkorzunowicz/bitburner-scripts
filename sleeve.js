/** @param {NS} ns */
export async function main(ns) {
    // it should take 18 hours 30 minutes for the Sleeves to recover
    const combatLevelExpertise = 80;
    const shockTreshold = 0; //0
    let sleevesDictionary = Object.fromEntries(Array.from({ length: ns.sleeve.getNumSleeves() }, (_, index) => [index, ns.sleeve.getSleeve(index)]));
    let shouldRun = true;
  
    let ags = ns.sleeve.getSleevePurchasableAugs('2');
  
    let augs = ns.singularity.getAugmentationsFromFaction('Illuminati');
  
    while (shouldRun) {
      for (let s in sleevesDictionary) {
        let sl = sleevesDictionary[s];
        // wait for shock to fall
        if (sl.shock <= shockTreshold) {
          buyAugs(ns, s);
          // are we in gang already? if yes, grind combat for covenant  and illuminati through shared exp
          if (ns.heart.break() < -54000) {
            let me = ns.getPlayer();
            // if (!me.factions.includes('The Covenant'))
            if (!isCombatExpert(me, 850))
              workout(ns, s, sl, 850, me);
            // else if (!me.factions.includes('Illuminati'))
            else if (!isCombatExpert(me, 1200))
              workout(ns, s, sl, 1200, me); //illuminati
            else homi(ns, s);
            // else {
            //   fieldWork(ns,s,'Illuminati');
            // }
  
          }
          // no gang, grind homicide
          else if (isCombatExpert(sl, combatLevelExpertise))
            homi(ns, s);
          else workout(ns, s, sl, combatLevelExpertise);
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
  function buyAugs(ns, s) {
    // they are all targeting combat skills to increase homicide rate, by the time sleeve are brought to 0 Shock, we should be making plenty of money
    ns.sleeve.purchaseSleeveAug(s, 'Neurotrainer I'); //$4.000m
    ns.sleeve.purchaseSleeveAug(s, 'Neurotrainer II'); //$45.000m
    ns.sleeve.purchaseSleeveAug(s, 'HemoRecirculator'); //$45.000m
    ns.sleeve.purchaseSleeveAug(s, 'NutriGen Implant'); //$2.500m
    ns.sleeve.purchaseSleeveAug(s, 'Power Recirculation Core'); //$180.000m
    ns.sleeve.purchaseSleeveAug(s, 'Neurotrainer III'); //$130.000m
    ns.sleeve.purchaseSleeveAug(s, 'Xanipher'); //$4.250b
    ns.sleeve.purchaseSleeveAug(s, 'Bionic Spine'); //$125.000m
    ns.sleeve.purchaseSleeveAug(s, 'Graphene Bionic Spine Upgrade'); //$6.000b
    ns.sleeve.purchaseSleeveAug(s, 'CordiARC Fusion Reactor'); //$5.000b
  }
  
  /** @param {SleevePerson} sl */
  function isCombatExpert(sl, level) {
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
  