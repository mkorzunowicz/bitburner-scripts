import { log } from 'common.js'

let trainTask;
let ascCalc;
let antiWantedTask;
let moneyTask;
let respTask;
let ascTreshold = 4;
let buyCombatEquipement = false;
/** @param {NS} ns */
export async function main(ns) {
  // HACK
  let shouldRun = true;
  const gangInfo = ns.gang.getGangInformation();
  if (gangInfo.isHacking) {

    // trainTask = 'Train Combat';
    // moneyTask = 'Train Combat';
    // antiWantedTask = 'Train Combat';
    // respTask = 'Train Combat';

    trainTask = 'Train Hacking';
    moneyTask = 'Money Laundering';
    antiWantedTask = 'Ethical Hacking';
    respTask = 'Cyberterrorism';
    ascCalc = function (member, ascResult) {
      return ascResult.hack * member.hack_asc_mult - member.hack_asc_mult > ascTreshold;
    };
  }
  else {
    if (ns.getResetInfo().currentNode == 8) {
      trainTask = 'Train Combat';
      antiWantedTask = 'Vigilante Justice';
      moneyTask = 'Mug People';
      respTask = 'Mug People';
    }
    else {
      trainTask = 'Train Combat';
      antiWantedTask = 'Vigilante Justice';
      moneyTask = 'Deal Drugs';
      respTask = 'Human Trafficking';

    }

    ascCalc = function (member, ascResult) {
      return ascResult.str * member.str_asc_mult - member.str_asc_mult > ascTreshold;
    };

  }

  while (shouldRun) {
    let members = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name));

    for (let member of members)
      ns.gang.setMemberTask(member.name, trainTask);
    await recruit(ns);
    const workable = workableGangers(ns);
    const working = []
    if (workable.length > 0) {

      if (members.length < 12) {
        // Cyberterrorism till we can recruit new guys
        const shuffled = shuffleArray(workable);
        let member;
        while (member = shuffled.shift()) {
          await ns.sleep(200);
          if (ns.gang.getGangInformation().wantedLevelGainRate < 0.3)
            ns.gang.setMemberTask(member.name, respTask);
          else
            ns.gang.setMemberTask(member.name, antiWantedTask);

        }

        // await ns.sleep(10 * 1000);
        await ns.sleep(1 * 500);
        let count = 30;
        // sleep till we can recruit next ganger
        while (shouldRun && !ns.gang.canRecruitMember() && count-- > 0) {
          ascend(ns);
          buyAugs(ns);
          await ns.sleep(3000);
        }
        // let's reduce the wanted level
        // for (let member of workable) {
        //   ns.gang.setMemberTask(member.name, antiWantedTask);
        // }
        await recruit(ns);
        // sleep till wanted level drops to 1
        // while (shouldRun && ns.gang.getGangInformation().wantedLevel > 1) {
        //   ascend(ns);
        //   await ns.sleep(500);
        // }
        // for (let member of workable)
        //   ns.gang.setMemberTask(member.name, trainTask);
      }
      else {
        // work for money
        const shuffled = shuffleArray(workable);
        let member;
        while (member = shuffled.shift()) {
          if (gangInfo.wantedLevelGainRate < 3)
            ns.gang.setMemberTask(member.name, moneyTask);
          else
            ns.gang.setMemberTask(member.name, antiWantedTask);

        }
      }
    }
    ascend(ns, false);
    buyAugs(ns);

    // shouldRun = false;
    // await ns.sleep(3000);
    await ns.sleep(1 * 500);
  }
}
/** @param {NS} ns */
function buyAugs(ns) {
  const members = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name));
  for (let member of members) {

    // total cost 20b
    if (ns.getPlayer().money > 20 * ns.gang.getEquipmentCost('Neuralstimulator')) {
      if (ns.gang.getGangInformation().isHacking) {
        ns.gang.purchaseEquipment(member.name, 'Neuralstimulator');
        ns.gang.purchaseEquipment(member.name, 'BitWire');
        ns.gang.purchaseEquipment(member.name, 'DataJack');

        ns.gang.purchaseEquipment(member.name, 'NUKE Rootkit');
        ns.gang.purchaseEquipment(member.name, 'Soulstealer Rootkit');
        ns.gang.purchaseEquipment(member.name, 'Hmap Node');
        ns.gang.purchaseEquipment(member.name, 'Demon Rootkit');
        ns.gang.purchaseEquipment(member.name, 'Jack the Ripper');
      }
      else {
        if (!buyCombatEquipement) continue;
        ns.gang.purchaseEquipment(member.name, 'Baseball Bat');
        ns.gang.purchaseEquipment(member.name, 'Katana');
        ns.gang.purchaseEquipment(member.name, 'P90C');
        ns.gang.purchaseEquipment(member.name, 'Glock 18C');
        ns.gang.purchaseEquipment(member.name, 'Steyr AUG');
        ns.gang.purchaseEquipment(member.name, 'AK-47');
        ns.gang.purchaseEquipment(member.name, 'AWM Sniper Rifle');
        ns.gang.purchaseEquipment(member.name, 'M15A10 Assault Rifle');

        ns.gang.purchaseEquipment(member.name, 'Bulletproof Vest');
        ns.gang.purchaseEquipment(member.name, 'Full Body Armor');
        ns.gang.purchaseEquipment(member.name, 'Liquid Body Armor');
        ns.gang.purchaseEquipment(member.name, 'Graphene Plating Armor');

        ns.gang.purchaseEquipment(member.name, 'Ford Flex V20');
        ns.gang.purchaseEquipment(member.name, 'ATX1070 Superbike');
        ns.gang.purchaseEquipment(member.name, 'Mercedes-Benz S9001');
        ns.gang.purchaseEquipment(member.name, 'White Ferrari');

        ns.gang.purchaseEquipment(member.name, 'Bionic Arms');
        ns.gang.purchaseEquipment(member.name, 'Bionic Legs');
        ns.gang.purchaseEquipment(member.name, 'Bionic Spine');
        ns.gang.purchaseEquipment(member.name, 'BrachiBlades');
        ns.gang.purchaseEquipment(member.name, 'Nanofiber Weave');
        ns.gang.purchaseEquipment(member.name, 'Synthetic Heart');
        ns.gang.purchaseEquipment(member.name, 'Synfibril Muscle');
        ns.gang.purchaseEquipment(member.name, 'Graphene Bone Lacings');
      }
    }
  }
}
async function recruit(ns) {
  while (ns.gang.canRecruitMember()) {
    const names = ns.gang.getMemberNames(); //array
    const name = "Ganger" + (names.length + 1);
    if (ns.gang.recruitMember(name)) {
      log(ns, 'Recruited: ' + name, 'info', 5 * 1000);
      ns.gang.setMemberTask(name, trainTask);
    }
    await ns.sleep(100);
  }
}
/** @param {NS} ns */
function ascend(ns, traineesOnly = true) {
  // Ascend
  let members = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name));
  for (let member of members) {
    if (traineesOnly && member.task != trainTask) continue;

    let ascResult = ns.gang.getAscensionResult(member.name);
    if (ascResult) {
      // ns.tprint(`${member.name} - hack: ${member.hack} asc_points: ${member.hack_asc_points} hack_asc_mult: ${member.hack_asc_mult} hack_mult: ${member.hack_mult}  ascRes: ${ascResult.hack} result: ${ascResult.hack * member.hack_asc_mult}`);
      // if (ascResult.hack > 2) 
      // if (ascResult.hack * member.hack_asc_mult - member.hack_asc_mult > 5)
      if (ascCalc(member, ascResult))
        if (ns.gang.ascendMember(member.name)) {
          log(ns, 'Ascended: ' + member.name, 'info', 5 * 1000);
          ns.gang.setMemberTask(member.name, trainTask);
        }
    }
  }
}
/** @param {NS} ns */
function workableGangers(ns) {
  const members = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name));
  if (ns.gang.getGangInformation().isHacking)
    return members.filter(obj => obj.hack > members.length * 150);
  else
    return members.filter(obj => obj.str > members.length * 150);
  // return members.filter(obj => obj.hack > 2000);
}

/** @param {Array} array */
function shuffleArray(array) {
  const shuffledArray = array.slice(); // Create a shallow copy of the original array
  shuffledArray.sort(() => Math.random() - 0.5);
  return shuffledArray;
}