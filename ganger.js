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

    const workable = workableGangers(ns);
    const working = []
    if (workable.length > 0) {

      if (members.length < 12) {
        // Cyberterrorism till we can recruit new guys
        const shuffled = shuffleArray(workable);
        let member;
        while (member = shuffled.shift()) {
          if (gangInfo.wantedLevelGainRate < 3)
            ns.gang.setMemberTask(member.name, respTask);
          else
            ns.gang.setMemberTask(member.name, antiWantedTask);

        }
        // sleep till we can recruit next ganger
        while (shouldRun && !ns.gang.canRecruitMember()) {
          ascend(ns);
          await ns.sleep(3000);
        }
        // let's reduce the wanted level
        for (let member of workable) {
          ns.gang.setMemberTask(member.name, antiWantedTask);
        }

        while (ns.gang.canRecruitMember()) {
          const names = ns.gang.getMemberNames(); //array
          const name = "Ganger" + (names.length + 1);
          if (ns.gang.recruitMember(name)) {
            log(ns, 'Recruited: ' + name, 'info', 5 * 1000);
            ns.gang.setMemberTask(name, trainTask);
          }
          await ns.sleep(100);
        }
        // sleep till wanted level drops to 1
        while (shouldRun && ns.gang.getGangInformation().wantedLevel > 1) {
          ascend(ns);
          await ns.sleep(3000);
        }
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

    // shouldRun = false;
    await ns.sleep(3000);
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
  return members.filter(obj => obj.hack > members.length * 250);
  // return members.filter(obj => obj.hack > 2000);
}

/** @param {Array} array */
function shuffleArray(array) {
  const shuffledArray = array.slice(); // Create a shallow copy of the original array
  shuffledArray.sort(() => Math.random() - 0.5);
  return shuffledArray;
}
  // Unassigned
  // Ransomware
  // Phishing
  // Identity Theft
  // DDoS Attacks
  // plant Vi rus
  // Fraud & Counterfeiting
  // Money Laundering
  // Cyberterrorism
  // Ethical Hacking
  // Vigilante Justice
  // Train Combat
  // Train Hacking
  // Train Charisma
  // Territory warfare

  // Ford Flex V20
  // 33 . OOOm
  // Mercedes-Benz s9001
  // 318. ooom
  // superbike ATX1070
  // . OOOm
  // white Ferrari
  // 330. OOOrn

  // Rootkit
  // NUKE
  // 35 . OOOrn
  // Rootkit
  // Demon
  // 375 . OOOm
  // Jack the Ripper
  // 375 . OOOm
  // soul stealer Rootkit
  // 325 . OOOrn
  // Hmap Node
  // 340. 000m


  // Bionic Arms
  // 310. OOOb
  // Bionic spine
  // . OOOb
  // Nanofi ber Weave
  // 312 . OOOb
  // synfibril Muscle
  // . OOOb
  // Neuralstimulator
  // 310. OOOb
  // Graphene Bone Laci ngs
  // 350. OOOb
  // Bionic Legs
  // 310. OOOb
  // BrachiB1ades
  // 320. OOOb
  // synthetic Heart
  // 325. OOOb
  // Bi twi re
  // . OOOb
  // DataJack
  // 37 . 500b

  // ns.gang.ascendMember(name)
  // ns.gang.canRecruitMember(); //true
  // ns.gang.inGang();
  // ns.gang.recruitMember(name);
  // ns.gang.getEquipmentNames(); //array

  // ns.gang.getEquipmentCost(name);
  // ns.gang.getTaskNames() //array

  // ns.gang.getTaskStats(name);
  // ns.gang.getMemberInformation(name);
  // ns.gang.setMemberTask(memberName, taskName); //true

  // ns.gang.getGangInformation()
  // ns.gang.getGangInformation().isHacking
  // ns.gang.getGangInformation().faction
  // ns.gang.getGangInformation().wantedLevel
  // ns.gang.getGangInformation().respect

