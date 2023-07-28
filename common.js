const wnd = eval("window");
const doc = wnd["document"];
/** Log to console, script, terminal and toast
 * @param {NS} ns
 * @param {string} msg Message to print
 * @param {string} type info (default) | warning | success | error
 * @param {number} time in ms
 */
export function log(ns, msg, type = 'info', time = 15 * 1000) {
  console.log(msg);
  ns.toast(msg, type, time);
  if (type == 'info' || type == 'success') {
    ns.print(msg);
    ns.tprint(msg);
  }
  else {
    ns.print(type.toUpperCase() + ": " + msg);
    ns.tprint(type.toUpperCase() + ": " + msg);
  }
}

/** Time taken in seconds between two dates
 * @param {Date} startDate start
 * @param {Date} endDate end
 */
export function timeTakenInSeconds(startDate, endDate) {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const timeDifferenceInMilliseconds = endTime - startTime;
  const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);

  return timeDifferenceInSeconds;
}
/** Formats duration to hh:mm:ss string
 * @param {number} seconds
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${formattedHours}:${formattedMinutes}:${Math.ceil(formattedSeconds)}`;
}


/** Starts a script and returns true/false depending on the result
 * @param {NS} ns
 * @param {scriptName} name of the string to run (must include .js)
 * @param {param} parameter to pass, optional
 */
export function startScript(ns, scriptName, param) {
  if (param) {
    if (!ns.isRunning(scriptName, 'home', param)) {
      if (ns.exec(scriptName, 'home', 1, param) != 0)
        return true;
    }
    else return true;
  }
  else if (!ns.isRunning(scriptName, 'home')) {
    if (ns.exec(scriptName, 'home', 1) != 0)
      return true;

    log(ns, `Couldn't start ${scriptName}!!!`, 'error');
    return false;
  }
  else return true;
}


export function stopScript(ns, scriptName, param) {
  if (!ns.isRunning(scriptName, 'home', 'noprompt')) {
    expandPid = ns.exec(scriptName, 'home', 1, 'noprompt');
    if (expandPid != 0)
      ns.tprint("Started server expand loop");
    else
      ns.tprint("ERROR Couldn't start expand loop!!!");
  }
}


/** @param {NS} ns */
export function numberOfPortsOpenable(ns) {
  let count = 0;
  if (ns.fileExists('BruteSSH.exe', 'home'))
    count++;
  if (ns.fileExists('FTPCrack.exe', 'home'))
    count++;
  if (ns.fileExists('relaySMTP.exe', 'home'))
    count++;
  if (ns.fileExists('HTTPWorm.exe', 'home'))
    count++;
  if (ns.fileExists('SQLInject.exe', 'home'))
    count++;
  return count;
}


/** @param {NS} ns
 * @param {string} serv Server to search through
 * @param {string} target The server to find
 * @param {Array<string>} visited Already visited servers
*/
export function recursive_lookup(ns, serv, target, visited = []) {
  visited.push(serv);
  if (serv === target) {
    return [serv];
  }
  for (const serv2 of ns.scan(serv)) {
    if (!visited.includes(serv2)) {
      const path = recursive_lookup(ns, serv2, target, visited);
      if (Array.isArray(path)) {
        if (!path.includes(serv2))
          path.push(serv2);
        return path;
      }
    }
  }
}

/** @param {NS} ns
 *  @param {String} target
*/
export async function crackPorts(ns, target) {
  try {
    if (ns.fileExists('BruteSSH.exe', 'home'))
      ns.brutessh(target);
    if (ns.fileExists('FTPCrack.exe', 'home'))
      ns.ftpcrack(target);
    if (ns.fileExists('relaySMTP.exe', 'home'))
      ns.relaysmtp(target);
    if (ns.fileExists('HTTPWorm.exe', 'home'))
      ns.httpworm(target);
    if (ns.fileExists('SQLInject.exe', 'home'))
      ns.sqlinject(target);
    ns.nuke(target);
    return true;
  }
  catch {
    // most probably ports not open
    return false;
  }
}

/** Maps the network and populates the 'visited' array with network names including 'home' and purchased servers
 *  @param {NS} ns 
 * @param {string} serv Server to search through
 * @param {Array<string>} visited Already visited servers array which gets populated as output
*/
export async function recursive_scan(ns, serv, visited) {
  visited.push(serv);

  for (const serv2 of ns.scan(serv)) {
    if (!visited.includes(serv2)) {
      await recursive_scan(ns, serv2, visited);
    }
  }
}
/** @param {NS} ns */
export function jumpTo(ns, target) {
  let path = recursive_lookup(ns, 'home', target);
  if (path instanceof (Array)) {
    path.reverse();
    for (const p of path) {
      ns.singularity.connect(p);
    }
  }
}
/** @param {NS} ns */
export function findNextBitNode(ns) {
  // can't find the current bitnode :/
  let sourceFiles = ns.singularity.getOwnedSourceFiles();
  // Check if all sourceFiles are at level 3
  const allAtLevel3 = sourceFiles.every(file => file.lvl === 3);

  if (allAtLevel3) {
    // Find the maximum value of 'n'
    const maxN = Math.max(...sourceFiles.map(file => file.n));

    // Check if there is a gap in the 'n' values
    for (let i = 1; i <= maxN; i++) {
      if (!sourceFiles.some(file => file.n === i)) {
        return i; // Return the first missing 'n'
      }
    }

    // If all numbers from 1 to maxN are present, propose the next one
    return maxN + 1;
  } else {
    // Filter out the sourceFiles with level less than 3 and sort them in ascending order
    const availableSourceFiles = sourceFiles.filter(file => file.lvl < 3).sort((a, b) => a.lvl - b.lvl);

    // Find the first available sourceFile (the one with the lowest level)
    const nextSourceFile = availableSourceFiles[0];

    // Return the number 'n' of the next sourceFile
    return nextSourceFile.n;
  }
}

export async function clickByXpath(xpath, trusted) {
  let element = finByXpath(xpath);
  if (element) {
    // Button found, do something with it
    if (trusted)
      await clickElementTrusted(element);
    else
      element.click(); // Example: Perform a click on the button
    // console.log("Clicked by xpath: " + xpath);
    return true;
  } else {
    // Button not found
    console.log("Element to click not found.: " + xpath);
    // ns.tprint("Button not found.");
    return false;
  }
}
export function finByXpath(xpath) {
  return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

export async function clickElementTrusted(elem) {
    // console.log(elem);
    try {
        await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
    }
    catch {

        await elem[Object.keys(elem)[1]].onMouseDown({ isTrusted: true });
    }
}