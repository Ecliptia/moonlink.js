let utils = require('./MoonlinkUtils.js')
class MoonFilters {
    #sendWs;
    constructor(options) {
        this.guildId = options.guildId
        this.#sendWs = options.sendWs
        if(!utils.filters[this.guildId]) utils.filters[this.guildId] = {
            nightcore: false,
            vaporweve: false,
            bassboost: false,
            pop: false,
            soft: false,
            treblebass: false,
            eightD: false,
            karaoke: false,
            vibrato: false,
            tremolo: false,
            custom: null
        }
        this.status = utils.filters[this.guildId] 
        
    }
      reset() {
         this.sendWs({
             op: 'filters',
             guildId: this.guildId
         })
         utils.filters[this.guildId] = {
            nightcore: false,
            vaporweve: false,
            bassboost: false,
            pop: false,
            soft: false,
            treblebass: false,
            eightD: false,
            karaoke: false,
            vibrato: false,
            tremolo: false,
            custom: null
        }
          return true
     }
     nightcore() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guild,
                    timescale: {
                        speed: 1.2999999523162842,
                        pitch: 1.2999999523162842,
                        rate: 1,
                    },
                })
         utils.filters[this.guildId] = { ...this.status, nightcore: true }
      }
      vaporwave() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    equalizer: [
                        { band: 1, gain: 0.3 },
                        { band: 0, gain: 0.3 },
                    ],
                    timescale: { pitch: 0.5 },
                    tremolo: { depth: 0.3, frequency: 14 },
                })
          utils.filters[this.guildId] = { ...this.status, vaporwave: true }
          return true
      }
      bassboost() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    equalizer: [
                        { band: 0, gain: 0.6 },
                        { band: 1, gain: 0.67 },
                        { band: 2, gain: 0.67 },
                        { band: 3, gain: 0 },
                        { band: 4, gain: -0.5 },
                        { band: 5, gain: 0.15 },
                        { band: 6, gain: -0.45 },
                        { band: 7, gain: 0.23 },
                        { band: 8, gain: 0.35 },
                        { band: 9, gain: 0.45 },
                        { band: 10, gain: 0.55 },
                        { band: 11, gain: 0.6 },
                        { band: 12, gain: 0.55 },
                        { band: 13, gain: 0 },
                    ],
                })
          
         utils.filters[this.guildId] = { ...this.status, bassboost: true }
          return true
      }
      pop() {
          this.sendWs({ op: "filters",
                    guildId: this.guildId,
                    equalizer: [
                        { band: 0, gain: 0.65 },
                        { band: 1, gain: 0.45 },
                        { band: 2, gain: -0.45 },
                        { band: 3, gain: -0.65 },
                        { band: 4, gain: -0.35 },
                        { band: 5, gain: 0.45 },
                        { band: 6, gain: 0.55 },
                        { band: 7, gain: 0.6 },
                        { band: 8, gain: 0.6 },
                        { band: 9, gain: 0.6 },
                        { band: 10, gain: 0 },
                        { band: 11, gain: 0 },
                        { band: 12, gain: 0 },
                        { band: 13, gain: 0 },
                    ],
                })
          
         utils.filters[this.guildId] = { ...this.status, pop: true }
          return true
      }
      soft() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    lowPass: {
                        smoothing: 20.0
                    }
                })
          
         utils.filters[this.guildId] = { ...this.status, soft: true }
          return true
      }
      treblebass() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    equalizer: [
                        { band: 0, gain: 0.6 },
                        { band: 1, gain: 0.67 },
                        { band: 2, gain: 0.67 },
                        { band: 3, gain: 0 },
                        { band: 4, gain: -0.5 },
                        { band: 5, gain: 0.15 },
                        { band: 6, gain: -0.45 },
                        { band: 7, gain: 0.23 },
                        { band: 8, gain: 0.35 },
                        { band: 9, gain: 0.45 },
                        { band: 10, gain: 0.55 },
                        { band: 11, gain: 0.6 },
                        { band: 12, gain: 0.55 },
                        { band: 13, gain: 0 },
                    ],
                })
          
         utils.filters[this.guildId] = { ...this.status, treblebass: true }
          return true
      }
      eightD() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    rotation: {
                        rotationHz: 0.2
                    }
                })
          
         utils.filters[this.guildId] = { ...this.status, eightD: true }
          return true
      }
      karaoke() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    karaoke: {
                        level: 1.0,
                        monoLevel: 1.0,
                        filterBand: 220.0,
                        filterWidth: 100.0
                    },
                })
          
         utils.filters[this.guildId] = { ...this.status, karaoke: true }
          return true
      }
      vibrato() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    vibrato: {
                        frequency: 10,
                        depth: 0.9
                    }
                })
          
         utils.filters[this.guildId] = { ...this.status, vibrato: true }
          return true
      }
      tremolo() {
          this.sendWs({
                    op: "filters",
                    guildId: this.guildId,
                    tremolo: {
                        frequency: 10,
                        depth: 0.5
                    }
                })
          
         utils.filters[this.guildId] = { ...this.status, tremolo: true }
          return true 
      }
      custom(e) {
          if(!e) throw new Error('undefined property')
          this.sendWs(e)
          
         utils.filters[this.guildId] = { ...this.status, custom: e }
          return true
      }
      sendWs(code) {
           this.#sendWs(code)
      }
}
module.exports = { MoonFilters }