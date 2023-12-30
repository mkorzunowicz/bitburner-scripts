# Bitburner scripts (2.5.1)

First of all not all of those scripts are my work - [infi.js](https://github.com/JasonGoemaat/bitburner-batcher/blob/master/main/tools/infiltrate.js) by someone with changes by Jason Goemaat and [stockmaster.js](https://github.com/alainbryden/bitburner-scripts/) (with helpers) by Alain Bryden.
Although I did change them insignificantly.

The main code is in starter.js. The automation revolves around looped infiltrations, hacking, upgrading servers and doing lots of additional things including automated Bitnode hacking.

Some of the code is wonky. Most of it is possibly not backwards compatible, as it evolved along with game progression.

> I hope it's obvious that going through the code is spoiling your fun! So do it at your own risk.

I avoided saving data to files, so usually the data is in memory, except for logs and its state. This is in local storage. I also avoided creating stringified code to save memory, as it kills any readability. With a few infiltrations you can buy enough anyhow, so it makes no sense. Infiltrations are in fact a bit overpowered, but makes everything ways faster too.

Corporations are overpowered too, so once you know how to evolve them quickly, you can make shitloads of money as well. The code for corporations is.. so so, as I looked into them at the end of my journey.

Have fun!
