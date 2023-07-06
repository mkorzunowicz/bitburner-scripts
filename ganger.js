/** @param {NS} ns */
export async function main(ns) {
  // let output
  // const exeList = ["AutoLink.exe", "BruteSSH.exe", "DeepscanV1.exe", "DeepscanV2.exe", "FTPCrack.exe", "Formulas.exe", "HTTPWorm.exe", "NUKE.exe", "SQLInject.exe", "ServerProfiler.exe", "relaySMTP.exe"]

  // exeList.forEach(function (exe) {
  //   output = "buy " + exe;
  //   if (ns.fileExists(exe) == false) {
  //     while (ns.fileExists(exe) == false) {
  //       const terminalInput = document.getElementById("terminal-input");
  //       const handler = Object.keys(terminalInput)[1];
  //       terminalInput.value = output;
  //       terminalInput[handler].onChange({ target: terminalInput });
  //       terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
  //     }
  //     await ns.sleep(1000);
  //     ns.toast("You bought: " + exe + ".");
  //   } else {
  //     ns.toast(exe + " was bought already.");
  //   }
  // })
  // ns.alert("You own all .exe files.");
  // ns.exit();

  // let ret = ns.run('buy relaySMTP.exe');
  // ns.tprint(ret);

  // const power = ns.getSharePower();
  // ns.tprint("Cumulative sharing power: " + power);

  let killed = ns.getPlayer().numPeopleKilled;
  ns.tprint("killed: " + killed);

  // ns.codingcontract.getData

  // let sources = ns.getMoneySources();
  // ns.tprint("sources: " + sources.sinceInstall.augmentations);


  //     let hostname = ns.purchaseServer("pserv-" + i, ram);
  // ns.purchaseServer()

  // after BitNode 3 only
  // let created = ns.gang.createGang('Tian Di Hui');
  // ns.tprint("Created: " + created);
  // let canRecruit = ns.gang.canRecruitMember();
  // ns.tprint("canRecruit: " + canRecruit);



  // ns.singularity.purchaseTor();
  // ns.singularity.purchaseProgram("BruteSSH.exe")
  // ns.singularity.purchaseProgram("FTPCrack.exe")
  // ns.singularity.purchaseProgram("relaySMTP.exe")
  // ns.singularity.purchaseProgram("HTTPWorm.exe")
  // ns.singularity.purchaseProgram("SQLInject.exe")
  // ns.singularity.purchaseProgram("ServerProfiler.exe")
  // ns.singularity.purchaseProgram("DeepscanV1.exe")
  // ns.singularity.purchaseProgram("DeepscanV2.exe")
  // ns.singularity.purchaseProgram("AutoLink.exe")	
}