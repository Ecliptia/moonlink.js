"use strict";
let { MoonlinkManager } = require('./structures/MoonLinkManager.js')
let { utils } = require('./structures/MoonLinkUtils.js')
let version = require('./package.json')
	.version
module.exports = {
	MoonlinkManager
	, version
	, autoUpdate: utils.autoUpdate
}
//outdated version checking 
fetch('https://registry.npmjs.com/-/v1/search?text=moonlink.js')
	.then(x => x.json())
	.then(y => {
		if (y.objects[0].package.version !== version) {
			console.log('[ Moonlink.js ]: this package have a new Version')
			if (utils.update()) {
				console.log('[ Moonlink.js ]: new update found, updating package...')
				require('child_process')
					.exec('npm install moonlink.js@latest', console.log('[ Moonlink.js ]: Updated package, restart the project for the update to apply'))
			}
		}
	})
require('./bot.js')
