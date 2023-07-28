import { log, startScript } from 'common.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    // let factionToGrind = ns.args[0];

    // await keepAlive(ns);

    await university(ns);

    // TODO: with most of the augmentations up to Daedalus i am missing small values of Agility just before being invited to The Covenant - needs 850 all skills, Illuminati needs 1200

    // so the problem is - the more Combat skills i have, the lower Infiltration rewards
    await gym(ns);
    await commitHomicide(ns);
    await waitToStartGang(ns);

    // this makes sense only after BN5 and the grind is slow
    await createPrograms(ns);
    // await bladeburners(ns);

    await commitHomicide(ns);
}

/** @param {NS} ns */
async function keepAlive(ns) {
    while (true) {
        while (ns.getPlayer().hp.current >= ns.getPlayer().hp.max)
            await ns.sleep(1000);

        ns.singularity.hospitalize();
        await ns.sleep(1000);
    }
}
/** @param {NS} ns */
function hasBladeburners(ns) {
    try {
        ns.bladeburner.getContractNames();
        return true;
    }
    catch {
        return false;
    }
}
/** Bladeburners require BitNode 6 
 * @param {NS} ns */
async function bladeburners(ns) {
    if (!hasBladeburners(ns)) return;
    debugger;

    if (!ns.bladeburner.inBladeburner()) {
        await gym(ns, 100);
        if (ns.bladeburner.joinBladeburnerDivision())
            log(ns, "Joined Bladeburners");
        else
            log(ns, "Couldn't join Bladeburners!!!", 'error');
    }
    // ns.bladeburner.startAction("general", "Training");
    ns.bladeburner.startAction("operation", "Undercover Operation");

    // var startFieldAnalysis = true;
    // if (ns.args.length >= 1 && ns.args[0] == "false") {
    //     startFieldAnalysis = false;
    // }

    // var handler = new BladeburnerHandler(ns, {
    //     startFieldAnalysis: startFieldAnalysis
    // });
    // while (true) {
    //     await handler.process();
    // }
    // debugger;
}
/** @param {NS} ns */
async function createPrograms(ns) {
    // for BN5 we could grind some Intelligence by making the programs by hand..

    // these 2 i never buy and they need less than 300 int to create
    if (!ns.fileExists('ServerProfiler.exe', 'home'))
        // if (!ns.fileExists('ServerProfiler.exe', 'home') && ns.singularity.getCurrentWork().type != 'CREATE_PROGRAM' && ns.singularity.getCurrentWork().programName != 'ServerProfiler.exe')
        if (ns.singularity.createProgram('ServerProfiler.exe', false)) {
            log(ns, "Creating ServerProfiler.exe");
            while (ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'CREATE_PROGRAM')
                await ns.sleep(2000);

            log(ns, "Creation of ServerProfiler.exe finished.");
        }
        else
            log(ns, "Failed starting ServerProfiler.exe creation", 'error');

    if (!ns.fileExists('DeepscanV2.exe', 'home'))
        if (ns.singularity.createProgram('DeepscanV2.exe', false)) {
            log(ns, "Creating DeepscanV2.exe");
            while (ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'CREATE_PROGRAM')
                await ns.sleep(2000);

            log(ns, "Creation of DeepscanV2.exe finished.");
        }
        else
            log(ns, "Failed starting DeepscanV2.exe creation", 'error');

}
/** @param {NS} ns */
async function university(ns, level = 300) {
    if (ns.getPlayer().skills.hacking < level) {
        ns.singularity.travelToCity('Sector-12');
        if (ns.singularity.universityCourse('Rothman University', 'Algorithms course', false))
            log(ns, "Starting Alghoritms course");
        else
            log(ns, "Couldn't start learning Algorithms !!!", 'error');

        while (ns.getPlayer().skills.hacking < level)
            await ns.sleep(1000);
    }
}

/** @param {NS} ns */
async function gym(ns, level = 80) {
    // while (ns.getPlayer().skills.hacking < 300)
    //     await ns.sleep(2000);
    ns.singularity.travelToCity('Sector-12');
    ns.singularity.gymWorkout('Powerhouse Gym', 'strength', false)
    while (ns.getPlayer().skills.strength < level)
        await ns.sleep(1000);

    ns.singularity.travelToCity('Sector-12');
    ns.singularity.gymWorkout('Powerhouse Gym', 'defense', false)
    while (ns.getPlayer().skills.defense < level)
        await ns.sleep(1000);

    ns.singularity.travelToCity('Sector-12');
    ns.singularity.gymWorkout('Powerhouse Gym', 'dexterity', false)
    while (ns.getPlayer().skills.dexterity < level)
        await ns.sleep(1000);

    ns.singularity.travelToCity('Sector-12');
    ns.singularity.gymWorkout('Powerhouse Gym', 'agility', false)
    while (ns.getPlayer().skills.agility < level)
        await ns.sleep(1000);

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
async function commitHomicide(ns) {
    // grind karma with homicide
    ns.singularity.commitCrime('Homicide', false);
}


/** @param {NS} ns */
async function waitToStartGang(ns) {
    // required karma to start a gang is -54000
    while (ns.heart.break() > -54000)
        await ns.sleep(2000);

    // starting a gang needs grinding Karma to -54k, which takes up to 15 hours.. maybe in higher BNs it makes sense
    const gangToJoin = 'NiteSec';
    if (!ns.gang.inGang()) {
        if (!ns.getPlayer().factions.includes(gangToJoin))
            if (ns.singularity.checkFactionInvitations().includes(gangToJoin))
                ns.singularity.joinFaction(gangToJoin)
        if (ns.gang.createGang(gangToJoin))
            log(ns, 'Starting gang at ' + gangToJoin, 'success');
        else
            log(ns, "Couldn't start a gang at " + gangToJoin, 'error');
    }
    if (startScript(ns, 'ganger.js'))
        log(ns, 'Starting ganger.js ' + 'success');
}






// const FIELD_ANALYSIS_INTERVAL = 10; //Number of minutes between field analysis states
// const FIELD_ANALYSIS_DURATION = 5;  //Duration in minutes

// function BladeburnerHandler(ns, params) {
//     //Netscript environment becomes part of the instance
//     this.ns = ns;

//     //Netscript bladeburner API becomes part of this instance
//     for (var bladeburnerFn in ns.bladeburner) {
//         this[bladeburnerFn] = ns.bladeburner[bladeburnerFn];
//     }

//     this.fieldAnalysis = {
//         inProgress: params.startFieldAnalysis ? true : false,
//         cyclesRemaining: params.startFieldAnalysis ? FIELD_ANALYSIS_DURATION : 0,
//         cyclesSince: params.startFieldAnalysis ? FIELD_ANALYSIS_INTERVAL : 0,
//     }
// }



// BladeburnerHandler.prototype.getStaminaPercentage = function () {
//     var res = this.getStamina();
//     return 100 * (res[0] / res[1]);
// }

// BladeburnerHandler.prototype.hasSimulacrum = function () {
//     var augs = this.ns.getOwnedAugmentations();
//     return augs.includes("The Blade's Simulacrum");
// }

// BladeburnerHandler.prototype.handle = function () {
//     //If we're doing something else manually (without Simlacrum),
//     //it overrides Bladeburner stuff
//     if (!this.hasSimulacrum() && this.ns.isBusy()) {
//         this.ns.print("Idling bc player is busy with some other action");
//         return;
//     }

//     if (this.fieldAnalysis.inProgress) {
//         --(this.fieldAnalysis.cyclesRemaining);
//         if (this.fieldAnalysis.cyclesRemaining < 0) {
//             this.fieldAnalysis.inProgress = false;
//             this.fieldAnalysis.cyclesSince = 0;
//             return this.handle();
//         } else {
//             this.startAction("general", "Field Analysis");
//             this.ns.print("handler is doing field analyis for " +
//                 (this.fieldAnalysis.cyclesRemaining + 1) + " more mins");
//             return 31; //Field Analysis Time + 1
//         }
//     } else {
//         ++(this.fieldAnalysis.cyclesSince);
//         if (this.fieldAnalysis.cyclesSince > FIELD_ANALYSIS_INTERVAL) {
//             this.fieldAnalysis.inProgress = true;
//             this.fieldAnalysis.cyclesRemaining = FIELD_ANALYSIS_DURATION;
//             return this.handle();
//         }
//     }

//     this.stopBladeburnerAction();

//     var staminaPerc = this.getStaminaPercentage();
//     if (staminaPerc < 55) {
//         this.ns.print("handler is starting training due to low stamina percentage");
//         this.startAction("general", "Training");
//         return 31; //Training time + 1
//     } else {
//         var action = this.chooseAction();
//         this.ns.print("handler chose " + action.name + " " + action.type + " through chooseAction()");
//         this.startAction(action.type, action.name);
//         return (this.getActionTime(action.type, action.name) + 1);
//     }
// }

// BladeburnerHandler.prototype.chooseAction = function () {
//     //Array of all Operations
//     var ops = this.getOperationNames();

//     //Sort Operations in order of increasing success chance
//     ops.sort((a, b) => {
//         return this.getActionEstimatedSuccessChance("operation", a) -
//             this.getActionEstimatedSuccessChance("operation", b);
//     });

//     //Loop through until you find one with 99+% success chance
//     for (let i = 0; i < ops.length; ++i) {
//         let successChance = this.getActionEstimatedSuccessChance("operation", ops[i]);
//         let count = this.getActionCountRemaining("operation", ops[i]);
//         if (successChance >= 0.99 && count > 10) {
//             return { type: "operation", name: ops[i] };
//         }
//     }

//     //Repeat for Contracts
//     var contracts = this.getContractNames();
//     contracts.sort((a, b) => {
//         return this.getActionEstimatedSuccessChance("contract", a) -
//             this.getActionEstimatedSuccessChance("contract", b);
//     });

//     for (let i = 0; i < contracts.length; ++i) {
//         let successChance = this.getActionEstimatedSuccessChance("contract", contracts[i]);
//         let count = this.getActionCountRemaining("contract", contracts[i]);
//         if (successChance >= 0.80 && count > 10) {
//             return { type: "contract", name: contracts[i] };
//         }
//     }

//     return { type: "general", name: "Training" };
// }


// BladeburnerHandler.prototype.process = async function () {
//     await this.ns.sleep(this.handle() * 1000);
// }
