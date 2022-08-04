"use strict";
let { MoonlinkManager } = require('./structures/MoonLinkManager.js')
let { utils } = require('./structures/MoonLinkUtils.js')
let version = require('./package.json')
	.version
module.exports = {
	MoonlinkManager
	, version
}

