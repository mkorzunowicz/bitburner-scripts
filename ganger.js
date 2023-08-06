import { log } from 'common.js'

let trainTask;
let ascCalc;
let antiWantedTask;
let moneyTask;
let respTask;
let ascTreshold = 4;
/** @param {NS} ns */
export async function main(ns) {
  let shouldRun = true;
  const gangInfo = ns.gang.getGangInformation();
  //TODO: add buying augments and weapons
  if (gangInfo.isHacking) {
    trainTask = 'Train Hacking';
    moneyTask = 'Money Laundering';
    antiWantedTask = 'Ethical Hacking';
    respTask = 'Cyberterrorism';
    ascCalc = function (member, ascResult) {
      return ascResult.hack * member.hack_asc_mult - member.hack_asc_mult > ascTreshold;
    };
  }
  else {
    trainTask = 'Train Combat';
    antiWantedTask = 'Vigilante Justice';
    moneyTask = 'Train Hacking';
    respTask = 'Human Traffiking';
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
        // sleep till we can recruit next ganger
        while (shouldRun && !ns.gang.canRecruitMember()) {
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
      ns.gang.purchaseEquipment(member.name, 'Neuralstimulator');
      ns.gang.purchaseEquipment(member.name, 'BitWire');
      ns.gang.purchaseEquipment(member.name, 'DataJack');
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
  return members.filter(obj => obj.hack > members.length * 150);
  // return members.filter(obj => obj.hack > 2000);
}

/** @param {Array} array */
function shuffleArray(array) {
  const shuffledArray = array.slice(); // Create a shallow copy of the original array
  shuffledArray.sort(() => Math.random() - 0.5);
  return shuffledArray;
}