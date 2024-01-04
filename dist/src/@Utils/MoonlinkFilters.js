"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkFilters = void 0;
const index_1 = require("../../index");
class MoonlinkFilters {
    player;
    manager;
    rest;
    volume;
    equalizer;
    karaoke;
    timescale;
    tremolo;
    vibrato;
    rotation;
    distortion;
    channelMix;
    lowPass;
    constructor(player) {
        this.player = player;
        this.rest = player.node.rest;
        this.manager = index_1.Structure.manager;
        this.volume = this.player.get("Fvolume") || null;
        this.equalizer = this.player.get("equalizer") || null;
        this.karaoke = this.player.get("karaoke") || null;
        this.timescale = this.player.get("timescale") || null;
        this.tremolo = this.player.get("tremolo") || null;
        this.vibrato = this.player.get("vibrato") || null;
        this.rotation = this.player.get("rotation") || null;
        this.distortion = this.player.get("distortion") || null;
        this.channelMix = this.player.get("channelMix") || null;
        this.lowPass = this.player.get("lowPass") || null;
    }
    setVolume(volume) {
        this.player.set("Fvolume", volume);
        this.volume = volume;
        this.updateFiltersFromRest();
        return this;
    }
    setEqualizer(equalizer) {
        this.player.set("equalizer", equalizer);
        this.equalizer = equalizer;
        this.updateFiltersFromRest();
        return this;
    }
    setKaraoke(karaoke) {
        this.player.set("karaoke", karaoke);
        this.karaoke = karaoke;
        this.updateFiltersFromRest();
        return this;
    }
    setTimescale(timescale) {
        this.player.set("timescale", timescale);
        this.timescale = timescale;
        this.updateFiltersFromRest();
        return this;
    }
    setTremolo(tremolo) {
        this.player.set("tremolo", tremolo);
        this.tremolo = tremolo;
        this.updateFiltersFromRest();
        return this;
    }
    setVibrato(vibrato) {
        this.player.set("vibrato", vibrato);
        this.vibrato = vibrato;
        this.updateFiltersFromRest();
        return this;
    }
    setRotation(rotation) {
        this.player.set("rotation", rotation);
        this.rotation = rotation;
        this.updateFiltersFromRest();
        return this;
    }
    setDistortion(distortion) {
        this.player.set("distortion", distortion);
        this.distortion = distortion;
        this.updateFiltersFromRest();
        return this;
    }
    setChannelMix(channelMix) {
        this.player.set("channelMix", channelMix);
        this.channelMix = channelMix;
        this.updateFiltersFromRest();
        return this;
    }
    setLowPass(lowPass) {
        this.player.set("lowPass", lowPass);
        this.lowPass = lowPass;
        this.updateFiltersFromRest();
        return this;
    }
    resetFilters() {
        this.setVolume(null);
        this.setEqualizer(null);
        this.setKaraoke(null);
        this.setTimescale(null);
        this.setTremolo(null);
        this.setVibrato(null);
        this.setRotation(null);
        this.setDistortion(null);
        this.setChannelMix(null);
        this.setLowPass(null);
        this.updateFiltersFromRest();
        return this;
    }
    async updateFiltersFromRest() {
        let { volume, equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass } = this;
        const dataToUpdate = {
            guildId: this.player.guildId,
            data: {
                filters: {
                    ...(volume !== null && { volume }),
                    ...(equalizer !== null && { equalizer }),
                    ...(karaoke !== null && { karaoke }),
                    ...(timescale !== null && { timescale }),
                    ...(tremolo !== null && { tremolo }),
                    ...(vibrato !== null && { vibrato }),
                    ...(rotation !== null && { rotation }),
                    ...(distortion !== null && { distortion }),
                    ...(channelMix !== null && { channelMix }),
                    ...(lowPass !== null && { lowPass })
                }
            }
        };
        await this.rest.update(dataToUpdate);
        return true;
    }
}
exports.MoonlinkFilters = MoonlinkFilters;
