/* eslint-disable filenames/match-regex */
const { wrapModuleWithTracking } = require(`./tracking-unsafe-module-wrapper`)

module.exports = wrapModuleWithTracking(`child_process`)
