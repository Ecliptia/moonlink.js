"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
class Filters {
    player;
    manager;
    rest;
    filters;
    constructor(player) {
        this.player = player;
        this.rest = player.node.rest;
        this.manager = player.manager;
        this.filters = {
            volume: player.get("Fvolume") || null,
            equalizer: player.get("equalizer") || null,
            karaoke: player.get("karaoke") || null,
            timescale: player.get("timescale") || null,
            tremolo: player.get("tremolo") || null,
            vibrato: player.get("vibrato") || null,
            rotation: player.get("rotation") || null,
            distortion: player.get("distortion") || null,
            channelMix: player.get("channelMix") || null,
            lowPass: player.get("lowPass") || null,
        };
    }
    setFilter(filterName, value) {
        this.player.set(filterName, value);
        this.filters[filterName] = value;
        this.updateFiltersFromRest();
        return this;
    }
    setVolume(volume) {
        return this.setFilter("volume", volume);
    }
    setEqualizer(equalizer) {
        return this.setFilter("equalizer", equalizer);
    }
    setKaraoke(karaoke) {
        return this.setFilter("karaoke", karaoke);
    }
    setTimescale(timescale) {
        return this.setFilter("timescale", timescale);
    }
    setTremolo(tremolo) {
        return this.setFilter("tremolo", tremolo);
    }
    setVibrato(vibrato) {
        return this.setFilter("vibrato", vibrato);
    }
    setRotation(rotation) {
        return this.setFilter("rotation", rotation);
    }
    setDistortion(distortion) {
        return this.setFilter("distortion", distortion);
    }
    setChannelMix(channelMix) {
        return this.setFilter("channelMix", channelMix);
    }
    setLowPass(lowPass) {
        return this.setFilter("lowPass", lowPass);
    }
    resetFilters() {
        Object.keys(this.filters).forEach(key => {
            this.setFilter(key, null);
        });
        return this;
    }
    async updateFiltersFromRest() {
        const dataToUpdate = {
            guildId: this.player.guildId,
            data: {
                filters: this.filters
            }
        };
        await this.rest.update(dataToUpdate);
        return true;
    }
}
exports.Filters = Filters;
//# sourceMappingURL=Filters.js.map