import { log, startScript, LogState, timeSinceBitNodeReset, formatDuration, expandServers, stopExpandingServers } from 'common.js'
import { getConfiguration } from 'helpers.js'

const argsSchema = [
    ['hackGraftLoop', false], //Just loop the hacking grafting
    ['dontGang', false], // BN2 challenge

];

export function autocomplete(data, args) {
    data.flags(argsSchema);
    return [];
}
let runOptions;

/**  @param {NS} ns */
export async function main(ns) {
    runOptions = getConfiguration(ns, argsSchema);
    if (!runOptions) return; // Invalid options, or ran in --help mode.

    if (runOptions.hackGraftLoop) {
        await hackGraftLoop(ns);
    }
    if (ns.getResetInfo().currentNode == 8) {
        // for BN8 challenge we want to avoid the need to install augmentation, therefore use the power of grafting

        // await allGraftLoop(ns);
        await waitForGraft(ns);
        await study(ns, 50);
        await createProg(ns, 'AutoLink');
        await createProg(ns, 'DeepscanV1');
        await createProg(ns, 'ServerProfiler');
        await createProg(ns, 'relaySMTP');
        await createProg(ns, 'FTPCrack');
        await createProg(ns, 'BruteSSH');
        await createProg(ns, 'HTTPWorm');
        await createProg(ns, 'SQLInject');
        await commitHomicide(ns);
        await waitForKarma(ns);

        // while (ns.getPlayer().money < 30_000_000_000)
        while (ns.getPlayer().money < 5_000_000_000)
            await ns.sleep(10000);
        // await graft(ns, [
        //     'OmniTek InfoLoad',
        //     'Neuronal Densification',
        //     'Xanipher',
        //     'nextSENS Gene Modification',
        //     'PC Direct-Neural Interface',
        //     'PC Direct-Neural Interface NeuroNet Injector',
        //     'PC Direct-Neural Interface Optimization Submodule',
        //     'Neurotrainer III',
        //     'ECorp HVMind Implant',
        //     'QLink',
        //     'nickofolas Congruity Implant'
        // ]);
        await allGraftLoop(ns);
        // await hackGraftLoop(ns);
    }
    const speakersCombatLevel = 300;
    const covenantCombatLevel = 850;
    const illuminatiCombatLevel = 1200;
    ns.disableLog('ALL');

    // await gym(ns, 100);
    if (!isGrafting(ns)) {

        await study(ns, 50);
        await createProg(ns, 'AutoLink');
        await createProg(ns, 'DeepscanV1');
        await createProg(ns, 'ServerProfiler');
        await createProg(ns, 'relaySMTP');
        await createProg(ns, 'FTPCrack');
        await createProg(ns, 'BruteSSH');
        await createProg(ns, 'HTTPWorm');
        await createProg(ns, 'SQLInject');

        //TODO: need to make checkpoints for Tetrads in 
        await gym(ns, 75);
        await commitHomicide(ns);
        await waitForKarma(ns, -18); // Tetrads

        await graft(ns, [
            'OmniTek InfoLoad',
            'Neuronal Densification',
            'Xanipher',
            'nextSENS Gene Modification',
            'PC Direct-Neural Interface',
            'PC Direct-Neural Interface NeuroNet Injector',
            'PC Direct-Neural Interface Optimization Submodule',
            'Neurotrainer III',
            'Artificial Bio-neural Network Implant', //12%
            'Unstable Circadian Modulator', //15% skill, 100% exp
            'Neural Accelerator',
            'SPTN-97 Gene Modification', //15%
            'BitRunners Neurolink',
            'The Black Hand',

            // 'ECorp HVMind Implant',
            'QLink',
            'nickofolas Congruity Implant'
        ]);
    }
    await waitForGraft(ns);

    await createProg(ns, 'DeepscanV2');

    await study(ns, 300);


    if (LogState.homicideFirstTime) {
        log(ns, `Starting homicide for the first time. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
        LogState.homicideFirstTime = false;
    }
    await commitHomicide(ns);
    if (!runOptions.dontGang)
        await waitForKarma(ns);

    //TODO: calculate the exp and hacking multipliers if in range for WorldDaemonDifficulty.. if yes, skip the gym
    await gym(ns, speakersCombatLevel);
    await gym(ns, covenantCombatLevel);
    // await gym(ns, illuminatiCombatLevel);
    await study(ns, ns.getBitNodeMultipliers().WorldDaemonDifficulty * 3000);
    await hackingWork(ns);
}

/** @param {NS} ns */
function graftNamesToObjects(ns, names) {
    return ns.grafting.getGraftableAugmentations().map(augName => {
        return {
            time: ns.grafting.getAugmentationGraftTime(augName),
            cost: ns.grafting.getAugmentationGraftPrice(augName),
            name: augName,
            // multis: ns.singularity.getAugmentationStats(augName)
        }
    });
}

/** @param {NS} ns */
async function allGraftLoop(ns) {

    let grafts = ns.grafting.getGraftableAugmentations().map(augName => {
        return {
            time: ns.grafting.getAugmentationGraftTime(augName),
            price: ns.grafting.getAugmentationGraftPrice(augName),
            multis: ns.singularity.getAugmentationStats(augName),
            prereq: ns.singularity.getAugmentationPrereq(augName),
            name: augName,
            // multis: ns.singularity.getAugmentationStats(augName)
        }
    });
    grafts.filter(g=>g.prereq.includes())
    let timeSorted = grafts.sort((a, b) => a.time - b.time);
    let priceSorted = grafts.sort((a, b) => a.price - b.price);
    let hackingSorted = grafts.sort((a, b) => b.multis.hacking - a.multis.hacking);
    let owned = ns.singularity.getOwnedAugmentations(true);
    let affordable = hackingSorted.filter(g=>g.price < ns.getPlayer().money);
    let filteredWithPreReq = affordable.filter(g=>g.prereq.every(pr=> owned.includes(pr)));
    let names = filteredWithPreReq.map(g => g.name);
    let sthToGraft = true;
    // return;
    while (sthToGraft) {
        await waitForGraft(ns);

        sthToGraft = await graft(ns, names, true);
    }
}
/** @param {NS} ns */
async function hackGraftLoop(ns) {
    let sthToGraft = true;
    while (sthToGraft) {
        await waitForGraft(ns);

        sthToGraft = await graft(ns, [
            'OmniTek InfoLoad',
            'Neuronal Densification',
            'Xanipher',
            'nextSENS Gene Modification',
            'PC Direct-Neural Interface',
            'PC Direct-Neural Interface NeuroNet Injector',
            'PC Direct-Neural Interface Optimization Submodule',
            // 'Neurotrainer III',
            'BitRunners Neurolink',
            'SPTN-97 Gene Modification',
            'The Black Hand',
            'CRTX42-AA Gene Modification',
            'Artificial Bio-neural Network Implant',
            'QLink'
        ], true);
    }
}

function isGrafting(ns) {
    return ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'GRAFTING';
}
/** @param {NS} ns */
async function waitForGraft(ns) {
    let runningGraft = false;
    let augName = "";
    while (ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'GRAFTING') {
        if (!runningGraft) {
            augName = ns.singularity.getCurrentWork().augmentation;
            runningGraft = true;
        }
        await ns.sleep(2000);
    }
    if (runningGraft) {
        LogState.graftingFinished = true;
        log(ns, `Grafting ${augName} finished. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
    }
    // TODO: if cancelled - log accordingly
}
/** Runs one of the available grafts per run
 *  @param {NS} ns */
async function graft(ns, augNames, overrideFinished = false) {
    if (!overrideFinished)
        if (LogState.graftingFinished) return;

    let augName;
    let augAvailable = false;
    while (!augAvailable && augNames.length > 0) {
        augName = augNames.shift();
        if (augName && ns.grafting.getGraftableAugmentations().includes(augName))
            augAvailable = true;
        await ns.sleep(100);
    }
    if (!augAvailable) return false;

    while (ns.grafting.getAugmentationGraftPrice(augName) > ns.getPlayer().money) {
        if (augName == 'QLink') {
            const incomePerSecond = ns.getTotalScriptIncome()[0];
            if (incomePerSecond > 8000000000) stopExpandingServers(ns);
        }
        await createProg(ns, 'DeepscanV2');
        await ns.sleep(2000);
    }

    const time = ns.grafting.getAugmentationGraftTime(augName);
    const cost = ns.grafting.getAugmentationGraftPrice(augName);
    if (augAvailable && cost < ns.getPlayer().money &&
        (ns.singularity.getCurrentWork() == null || ns.singularity.getCurrentWork().type != 'GRAFTING')) {
        if (ns.singularity.travelToCity('New Tokyo'))
            if (ns.grafting.graftAugmentation(augName, false))
                log(ns, `Grafting ${augName} for ${ns.nFormat(cost, "0.0a")} started. Should take ${formatDuration(time / 1000)}`, 'warning', 60 * 1000, true);

        // while (ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'GRAFTING')
        //     await ns.sleep(2000);
        // log(ns, `Grafting ${augName} for ${ns.nFormat(cost, "0.0a")} finished`, 'success', 30 * 1000, true);
    }
    return true;
    //Neurotrainer III
    // All Exp +20%


    // Neuronal Densification (Clarke Incorporated)
    // Money Cost: $1.375b
    // Reputation: 187.500k
    // Hacking Skill +15%
    // Hacking Exp +10%
    // Hack/Grow/Weaken Speed +3%

    // nextSENS Gene Modification (Clarke Incorporated)
    // Money Cost: $1.925b
    // Reputation: 437.500k
    // All Skills +20%

    // Xanipher (NWO)
    // Money Cost: $4.250b
    // Reputation: 875.000k
    // All Skills +20%
    // All Exp +15%

    // ECorp HVMind Implant (ECorp)
    // Money Cost: $5.500b
    // Reputation: 1.500m
    // Grow Power +200%


    // this is from a company, so a perfect choice
    // OmniTek InfoLoad
    // Time to Graft: 48 minutes 57 seconds
    // // $8b
    // Effects:
    // +20.00% hacking skill
    // +25.00% hacking exp


    // Neuronal Densification
    // $8 gb
    // Time to Graft: 1 hour 23 seconds
    // The brain is surgically re-engineered to have increased neuronal density by decreasing the neuron gap junction. Then, the body is genetically modified to enhance the production and capabilities of its neural stem cells.
    // Effects:
    // +15.00% hacking skill
    // +10.00% hacking exp
    // +3.00% faster hack(), grow(), and weaken()


    // nextSENS Gene Modification
    // $5b
    // Time to Graft: 1 hour 31 minutes 20 seconds
    // The body is genetically re-engineered to maintain a state of negligible senescence, preventing the body from deteriorating with age.
    // Effects:
    // +20.00% all skills

    // PC Direct-Neural Interface
    // $11b
    // Time to Graft: 47 minutes 19 seconds
    // Installs a Direct-Neural Interface jack into your arm that is compatible with most computers. Connecting to a computer through this jack allows you to interface with it using the brain's electrochemical signals.
    // Effects:
    // +8.00% hacking skill
    // +30.00% reputation from companies

    // PC Direct-Neural Interface NeuroNet Injector
    // $22b
    // Time to Graft: 1 hour 9 minutes 0 seconds
    // Pre-Requisites:
    // PC Direct-Neural Interface
    // This is an additional installation that upgrades the functionality of the PC Direct-Neural Interface augmentation. When connected to a computer, the Neural Network upgrade allows the user to use their own brain's processing power to aid the computer in computational tasks.
    // Effects:
    // +10.00% hacking skill
    // +5.00% faster hack(), grow(), and weaken()
    // +100.00% reputation from companies

    // PC Direct-Neural Interface Optimization Submodule
    // $13b
    // Time to Graft: 54 minutes 21 seconds
    // Pre-Requisites:
    // PC Direct-Neural Interface
    // This is a submodule upgrade to the PC Direct-Neural Interface augmentation. It improves the performance of the interface and gives the user more control options to a connected computer.
    // Effects:
    // +10.00% hacking skill
    // +75.00% reputation from companies

}

/** @param {NS} ns */
async function createProg(ns, progName) {
    // for BN5 we could grind some Intelligence by making the programs by hand..
    let prog = progName + '.exe';
    if (!ns.fileExists(prog, 'home'))
        if (ns.singularity.createProgram(prog, false)) {
            log(ns, `Creating ${prog}`);

            while (ns.singularity.getCurrentWork() && ns.singularity.getCurrentWork().type == 'CREATE_PROGRAM')
                await ns.sleep(2000);

            log(ns, `Creation of ${prog} finished.`);
        }
        else
            log(ns, `Failed starting ${prog} creation`, 'error');
}

/** @param {NS} ns */
async function study(ns, level = 300) {
    if (ns.getPlayer().skills.hacking < level) {

        if (ns.singularity.travelToCity('Volhaven')) {
            if (ns.singularity.universityCourse('ZB Institute of Technology', 'Algorithms course', false))
                log(ns, "Starting Alghoritms course in ZB");
            else
                log(ns, "Couldn't start learning Algorithms !!!", 'error');
        }
        else {
            if (ns.singularity.universityCourse('Rothman University', 'Algorithms course', false))
                log(ns, "Starting Alghoritms course in Rothman");
            else
                log(ns, "Couldn't start learning Algorithms !!!", 'error');
        }
        while (ns.getPlayer().skills.hacking < level)
            await ns.sleep(1000);
    }
}

/** @param {NS} ns */
async function gym(ns, level = 75) {
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
async function commitHomicide(ns) {
    // grind karma with homicide
    ns.singularity.commitCrime('Homicide', false);
}


/** @param {NS} ns */
async function waitForKarma(ns, karma = -54000) {
    // required karma to start a gang is -54000
    while (ns.heart.break() > karma)
        await ns.sleep(2000);

    if (karma <= -54000) {
        // starting a gang needs grinding Karma to -54k, which takes up to 15 hours.. maybe in higher BNs it makes sense
        // const gangToJoin = 'NiteSec'; // hacking
        const gangToJoin = 'Speakers for the Dead'; // combat
        if (!ns.gang.inGang()) {
            if (!ns.getPlayer().factions.includes(gangToJoin))
                if (ns.singularity.checkFactionInvitations().includes(gangToJoin))
                    ns.singularity.joinFaction(gangToJoin)
            if (ns.gang.createGang(gangToJoin))
                log(ns, `Starting gang at ${gangToJoin}. Since reset: ${timeSinceBitNodeReset(ns)}`, 'success', 30 * 1000, true);
            else
                log(ns, "Couldn't start a gang at " + gangToJoin, 'error');
        }
        if (startScript(ns, 'ganger.js', true))
            log(ns, 'Starting ganger.js ' + 'success');
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
async function keepAlive(ns) {
    while (true) {
        while (ns.getPlayer().hp.current >= ns.getPlayer().hp.max)
            await ns.sleep(1000);

        ns.singularity.hospitalize();
        await ns.sleep(1000);
    }
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
async function hackingWork(ns) {
    let factions = ns.getPlayer().factions;
    while (!factions.includes('Daedalus')) {
        factions = ns.getPlayer().factions;
        await ns.sleep(2000);
    }

    log(ns, 'Starting hacking work');
    if (factions.includes('Daedalus'))
        ns.singularity.workForFaction('Daedalus', 'hacking', false);
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
