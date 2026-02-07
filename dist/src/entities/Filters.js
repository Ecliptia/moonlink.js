"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
const Util_1 = require("../Util");
class Filters {
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
    echo;
    chorus;
    compressor;
    highpass;
    phaser;
    spatial;
    pluginFilters;
    activeFilters = new Set();
    customDefinitions = new Map();
    player;
    assertNodeLinkFeature(feature) {
        if (!this.player.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)(`filter:${feature}`);
        }
    }
    static BUILTIN_FILTERS = {
        "8d": { rotation: { rotationHz: 0.2 } },
        "nightcore": { timescale: { speed: 1.2, pitch: 1.2, rate: 1 } },
        "vaporwave": { timescale: { speed: 0.8, pitch: 0.8, rate: 1 } },
        "chipmunk": { timescale: { speed: 1, pitch: 1.5, rate: 1 } },
        "darthvader": { timescale: { speed: 1, pitch: 0.5, rate: 1 } },
        "daycore": { timescale: { speed: 0.8, pitch: 0.8, rate: 1 } },
        "double-time": { timescale: { speed: 1.5, pitch: 1, rate: 1 } },
        "karaoke": { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
        "soft": {
            equalizer: [
                { band: 0, gain: 0 }, { band: 1, gain: 0 }, { band: 2, gain: 0 },
                { band: 3, gain: 0 }, { band: 4, gain: 0 }, { band: 5, gain: 0 },
                { band: 6, gain: 0 }, { band: 7, gain: 0 }, { band: 8, gain: -0.25 },
                { band: 9, gain: -0.25 }, { band: 10, gain: -0.25 }, { band: 11, gain: -0.25 },
                { band: 12, gain: -0.25 }, { band: 13, gain: -0.25 }, { band: 14, gain: -0.25 }
            ]
        },
        "pop": {
            equalizer: [
                { band: 0, gain: 0.65 }, { band: 1, gain: 0.45 }, { band: 2, gain: -0.45 },
                { band: 3, gain: -0.65 }, { band: 4, gain: -0.35 }, { band: 5, gain: 0.45 },
                { band: 6, gain: 0.55 }, { band: 7, gain: 0.6 }, { band: 8, gain: 0.6 },
                { band: 9, gain: 0.6 }, { band: 10, gain: 0 }, { band: 11, gain: 0 },
                { band: 12, gain: 0 }, { band: 13, gain: 0 }, { band: 14, gain: 0 }
            ]
        },
        "treblebass": {
            equalizer: [
                { band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 2, gain: 0.67 },
                { band: 3, gain: 0 }, { band: 4, gain: -0.5 }, { band: 5, gain: 0.15 },
                { band: 6, gain: -0.45 }, { band: 7, gain: 0.23 }, { band: 8, gain: 0.35 },
                { band: 9, gain: 0.45 }, { band: 10, gain: 0.55 }, { band: 11, gain: 0.6 },
                { band: 12, gain: 0.55 }, { band: 13, gain: 0 }, { band: 14, gain: 0 }
            ]
        },
        "bassboost-low": {
            equalizer: [
                { band: 0, gain: 0.2 }, { band: 1, gain: 0.15 }, { band: 2, gain: 0.1 },
                { band: 3, gain: 0.05 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.05 },
                { band: 6, gain: -0.1 }, { band: 7, gain: -0.1 }, { band: 8, gain: -0.1 },
                { band: 9, gain: -0.1 }, { band: 10, gain: -0.1 }, { band: 11, gain: -0.1 },
                { band: 12, gain: -0.1 }, { band: 13, gain: -0.1 }, { band: 14, gain: -0.1 }
            ]
        },
        "bassboost-medium": {
            equalizer: [
                { band: 0, gain: 0.4 }, { band: 1, gain: 0.3 }, { band: 2, gain: 0.2 },
                { band: 3, gain: 0.1 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.05 },
                { band: 6, gain: -0.1 }, { band: 7, gain: -0.1 }, { band: 8, gain: -0.1 },
                { band: 9, gain: -0.1 }, { band: 10, gain: -0.1 }, { band: 11, gain: -0.1 },
                { band: 12, gain: -0.1 }, { band: 13, gain: -0.1 }, { band: 14, gain: -0.1 }
            ]
        },
        "bassboost-high": {
            equalizer: [
                { band: 0, gain: 0.6 }, { band: 1, gain: 0.45 }, { band: 2, gain: 0.3 },
                { band: 3, gain: 0.15 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.05 },
                { band: 6, gain: -0.1 }, { band: 7, gain: -0.1 }, { band: 8, gain: -0.1 },
                { band: 9, gain: -0.1 }, { band: 10, gain: -0.1 }, { band: 11, gain: -0.1 },
                { band: 12, gain: -0.1 }, { band: 13, gain: -0.1 }, { band: 14, gain: -0.1 }
            ]
        },
        "earrape": {
            equalizer: Array.from({ length: 15 }, (_, i) => ({ band: i, gain: 0.25 }))
        }
    };
    constructor(player) {
        this.player = player;
        this.loadGlobalFilters();
    }
    loadGlobalFilters() {
        const globalFilters = this.player.manager.options.customFilters || {};
        for (const [name, value] of Object.entries(globalFilters)) {
            const filter = typeof value === "string" ? this.parseString(value) : value;
            this.customDefinitions.set(name, filter);
        }
        this.player.manager.emit("debug", `Moonlink.js > Filters >> Loaded ${this.customDefinitions.size} global custom filters.`);
    }
    get available() {
        return [...Object.keys(Filters.BUILTIN_FILTERS), ...this.customDefinitions.keys()];
    }
    get enabled() {
        return [...this.activeFilters];
    }
    get active() {
        return new Set(this.activeFilters);
    }
    list() {
        return this.available;
    }
    set(name, value) {
        (0, Util_1.validate)(name, n => typeof n === "string" && n.length > 0, "Filter name must be a non-empty string.");
        const filter = typeof value === "string" ? this.parseString(value) : value;
        this.customDefinitions.set(name, filter);
        this.player.manager.emit("debug", `Moonlink.js > Filters >> Custom filter "${name}" defined.`);
        return this;
    }
    toJSON() {
        return {
            volume: this.volume,
            equalizer: this.equalizer,
            karaoke: this.karaoke,
            timescale: this.timescale,
            tremolo: this.tremolo,
            vibrato: this.vibrato,
            rotation: this.rotation,
            distortion: this.distortion,
            channelMix: this.channelMix,
            lowPass: this.lowPass,
            echo: this.echo,
            chorus: this.chorus,
            compressor: this.compressor,
            highpass: this.highpass,
            phaser: this.phaser,
            spatial: this.spatial,
            pluginFilters: this.pluginFilters,
            activeFilters: [...this.activeFilters],
        };
    }
    _updateFilters() {
        this.player.updateData('filters', this.toJSON());
    }
    define(name, value) {
        return this.set(name, value);
    }
    has(name) {
        return this.activeFilters.has(name);
    }
    isActive(name) {
        return this.activeFilters.has(name);
    }
    enable(name) {
        if (!this.exists(name)) {
            throw new Error(`Filter "${name}" does not exist. Available filters: ${this.available.join(", ")}`);
        }
        this.activeFilters.add(name);
        this._updateFilters();
        this.player.manager.emit("debug", `Moonlink.js > Filters >> Filter "${name}" enabled.`);
        return this;
    }
    disable(name) {
        this.activeFilters.delete(name);
        this._updateFilters();
        this.player.manager.emit("debug", `Moonlink.js > Filters >> Filter "${name}" disabled.`);
        return this;
    }
    toggle(name) {
        if (this.has(name)) {
            return this.disable(name);
        }
        else {
            return this.enable(name);
        }
    }
    enableMultiple(names) {
        for (const name of names) {
            this.enable(name);
        }
        return this;
    }
    disableMultiple(names) {
        for (const name of names) {
            this.disable(name);
        }
        return this;
    }
    exists(name) {
        return name in Filters.BUILTIN_FILTERS || this.customDefinitions.has(name);
    }
    getFilter(name) {
        return Filters.BUILTIN_FILTERS[name] || this.customDefinitions.get(name);
    }
    setVolume(volume) {
        (0, Util_1.validate)(volume, v => typeof v === "number" && !isNaN(v), "Volume must be a number.");
        this.volume = Math.max(0, Math.min(volume, 1000));
        this._updateFilters();
        return this;
    }
    setEqualizer(bands) {
        this.equalizer = bands;
        this._updateFilters();
        return this;
    }
    setKaraoke(karaoke) {
        this.karaoke = karaoke;
        this._updateFilters();
        return this;
    }
    setTimescale(timescale) {
        this.timescale = timescale;
        this._updateFilters();
        return this;
    }
    setTremolo(tremolo) {
        this.tremolo = tremolo;
        this._updateFilters();
        return this;
    }
    setVibrato(vibrato) {
        this.vibrato = vibrato;
        this._updateFilters();
        return this;
    }
    setRotation(rotation) {
        this.rotation = rotation;
        this._updateFilters();
        return this;
    }
    setDistortion(distortion) {
        this.distortion = distortion;
        this._updateFilters();
        return this;
    }
    setChannelMix(channelMix) {
        this.channelMix = channelMix;
        this._updateFilters();
        return this;
    }
    setLowPass(lowPass) {
        this.lowPass = lowPass;
        this._updateFilters();
        return this;
    }
    setEcho(echo) {
        this.assertNodeLinkFeature("echo");
        this.echo = echo;
        this._updateFilters();
        return this;
    }
    setChorus(chorus) {
        this.assertNodeLinkFeature("chorus");
        this.chorus = chorus;
        this._updateFilters();
        return this;
    }
    setCompressor(compressor) {
        this.assertNodeLinkFeature("compressor");
        this.compressor = compressor;
        this._updateFilters();
        return this;
    }
    setHighPass(highpass) {
        this.assertNodeLinkFeature("highpass");
        this.highpass = highpass;
        this._updateFilters();
        return this;
    }
    setPhaser(phaser) {
        this.assertNodeLinkFeature("phaser");
        this.phaser = phaser;
        this._updateFilters();
        return this;
    }
    setSpatial(spatial) {
        this.assertNodeLinkFeature("spatial");
        this.spatial = spatial;
        this._updateFilters();
        return this;
    }
    setSpeed(speed) {
        if (!this.timescale)
            this.timescale = {};
        this.timescale.speed = speed;
        this._updateFilters();
        return this;
    }
    setPitch(pitch) {
        if (!this.timescale)
            this.timescale = {};
        this.timescale.pitch = pitch;
        this._updateFilters();
        return this;
    }
    remove(filterName) {
        if (Filters.BUILTIN_FILTERS[filterName] || this.customDefinitions.has(filterName)) {
            return this.disable(filterName);
        }
        if (filterName === "volume")
            this.volume = undefined;
        else if (filterName === "equalizer")
            this.equalizer = undefined;
        else if (filterName === "karaoke")
            this.karaoke = undefined;
        else if (filterName === "timescale")
            this.timescale = undefined;
        else if (filterName === "tremolo")
            this.tremolo = undefined;
        else if (filterName === "vibrato")
            this.vibrato = undefined;
        else if (filterName === "rotation")
            this.rotation = undefined;
        else if (filterName === "distortion")
            this.distortion = undefined;
        else if (filterName === "channelMix")
            this.channelMix = undefined;
        else if (filterName === "lowPass")
            this.lowPass = undefined;
        else if (filterName === "echo")
            this.echo = undefined;
        else if (filterName === "chorus")
            this.chorus = undefined;
        else if (filterName === "compressor")
            this.compressor = undefined;
        else if (filterName === "highpass")
            this.highpass = undefined;
        else if (filterName === "phaser")
            this.phaser = undefined;
        else if (filterName === "spatial")
            this.spatial = undefined;
        else if (this.pluginFilters && this.pluginFilters[filterName])
            delete this.pluginFilters[filterName];
        this._updateFilters();
        return this;
    }
    setPluginFilters(filters) {
        this.pluginFilters = filters;
        this._updateFilters();
        return this;
    }
    clear() {
        this.volume = undefined;
        this.equalizer = undefined;
        this.karaoke = undefined;
        this.timescale = undefined;
        this.tremolo = undefined;
        this.vibrato = undefined;
        this.rotation = undefined;
        this.distortion = undefined;
        this.channelMix = undefined;
        this.lowPass = undefined;
        this.echo = undefined;
        this.chorus = undefined;
        this.compressor = undefined;
        this.highpass = undefined;
        this.phaser = undefined;
        this.spatial = undefined;
        this.pluginFilters = undefined;
        this.activeFilters.clear();
        this.player.manager.emit("debug", `Moonlink.js > Filters >> All filters cleared.`);
        this._updateFilters();
        return this;
    }
    reset() {
        return this.clear();
    }
    async apply() {
        let payload = {};
        if (!this.player.node.isNodeLink && (this.echo || this.chorus || this.compressor || this.highpass || this.phaser || this.spatial)) {
            throw (0, Util_1.nodeLinkOnlyError)("filters");
        }
        for (const name of this.activeFilters) {
            const filter = this.getFilter(name);
            if (filter) {
                payload = this.mergeFilters(payload, filter);
            }
        }
        const directFilters = {
            volume: this.volume,
            equalizer: this.equalizer,
            karaoke: this.karaoke,
            timescale: this.timescale,
            tremolo: this.tremolo,
            vibrato: this.vibrato,
            rotation: this.rotation,
            distortion: this.distortion,
            channelMix: this.channelMix,
            lowPass: this.lowPass,
            echo: this.echo,
            chorus: this.chorus,
            compressor: this.compressor,
            highpass: this.highpass,
            phaser: this.phaser,
            spatial: this.spatial,
            pluginFilters: this.pluginFilters,
        };
        for (const key in directFilters) {
            if (directFilters[key] !== undefined) {
                payload[key] = directFilters[key];
            }
        }
        this.player.manager.emit("debug", `Moonlink.js > Filters >> Applying filters: ${JSON.stringify(payload)}`);
        this.player.manager.emit("filtersUpdate", this.player, this);
        const updatedPlayer = await this.player.updatePlayer({ filters: payload });
        if (updatedPlayer) {
            this.player.volume = updatedPlayer.volume;
        }
        return this.player;
    }
    mergeFilters(base, addon) {
        const merged = { ...base };
        for (const key in addon) {
            if (addon[key] !== undefined) {
                if (key === "equalizer" && base.equalizer) {
                    merged.equalizer = [...base.equalizer, ...addon.equalizer];
                }
                else {
                    merged[key] = addon[key];
                }
            }
        }
        return merged;
    }
    parseString(filterString) {
        const filters = {};
        const parts = filterString.split(",").map(p => p.trim());
        for (const part of parts) {
            if (!part)
                continue;
            const [name, ...valueParts] = part.split("=");
            const value = valueParts.join("=");
            switch (name.toLowerCase()) {
                case "bass": {
                    const gain = this.parseGain(value);
                    filters.equalizer = Array.from({ length: 6 }, (_, i) => ({ band: i, gain }));
                    break;
                }
                case "treble": {
                    const gain = this.parseGain(value);
                    filters.equalizer = Array.from({ length: 6 }, (_, i) => ({ band: i + 7, gain }));
                    break;
                }
                case "vibrato": {
                    const frequency = this.parseParam(value, "f", 2);
                    const depth = this.parseParam(value, "d", 0.5);
                    filters.vibrato = {
                        frequency: Math.max(0, Math.min(14, frequency)),
                        depth: Math.max(0, Math.min(1, depth))
                    };
                    break;
                }
                case "tremolo": {
                    const frequency = this.parseParam(value, "f", 2);
                    const depth = this.parseParam(value, "d", 0.5);
                    filters.tremolo = {
                        frequency: Math.max(0, frequency),
                        depth: Math.max(0, Math.min(1, depth))
                    };
                    break;
                }
                case "atempo":
                case "speed": {
                    const speed = parseFloat(value) || 1;
                    filters.timescale = { ...filters.timescale, speed: Math.max(0.1, Math.min(3, speed)) };
                    break;
                }
                case "pitch": {
                    const pitch = parseFloat(value) || 1;
                    filters.timescale = { ...filters.timescale, pitch: Math.max(0.1, Math.min(3, pitch)) };
                    break;
                }
                case "rate": {
                    const rate = parseFloat(value) || 1;
                    filters.timescale = { ...filters.timescale, rate: Math.max(0.1, Math.min(3, rate)) };
                    break;
                }
                case "rubberband": {
                    const pitch = this.parseParam(value, "pitch", 1);
                    filters.timescale = { ...filters.timescale, pitch: Math.max(0.1, Math.min(3, pitch)) };
                    break;
                }
                case "rotation":
                case "8d": {
                    const rotationHz = parseFloat(value) || 0.2;
                    filters.rotation = { rotationHz };
                    break;
                }
                case "karaoke": {
                    filters.karaoke = {
                        level: this.parseParam(value, "level", 1.0),
                        monoLevel: this.parseParam(value, "monoLevel", 1.0),
                        filterBand: this.parseParam(value, "filterBand", 220.0),
                        filterWidth: this.parseParam(value, "filterWidth", 100.0)
                    };
                    break;
                }
                case "lowpass": {
                    const smoothing = parseFloat(value) || 20;
                    filters.lowPass = { smoothing: Math.max(1, smoothing) };
                    break;
                }
                case "channelmix": {
                    filters.channelMix = {
                        leftToLeft: this.parseParam(value, "leftToLeft", 1),
                        leftToRight: this.parseParam(value, "leftToRight", 0),
                        rightToLeft: this.parseParam(value, "rightToLeft", 0),
                        rightToRight: this.parseParam(value, "rightToRight", 1)
                    };
                    break;
                }
                case "distortion": {
                    filters.distortion = {
                        sinOffset: this.parseParam(value, "sinOffset", 0),
                        sinScale: this.parseParam(value, "sinScale", 1),
                        cosOffset: this.parseParam(value, "cosOffset", 0),
                        cosScale: this.parseParam(value, "cosScale", 1),
                        tanOffset: this.parseParam(value, "tanOffset", 0),
                        tanScale: this.parseParam(value, "tanScale", 1),
                        offset: this.parseParam(value, "offset", 0),
                        scale: this.parseParam(value, "scale", 1)
                    };
                    break;
                }
                default: {
                    if (!filters.pluginFilters)
                        filters.pluginFilters = {};
                    filters.pluginFilters[name] = value || true;
                    break;
                }
            }
        }
        return filters;
    }
    parseGain(value) {
        const match = value.match(/g=(-?\d+\.?\d*)/);
        if (match) {
            const g = parseFloat(match[1]);
            return Math.max(-0.25, Math.min(1.0, g * 0.05));
        }
        return 0;
    }
    parseParam(value, param, defaultValue) {
        const regex = new RegExp(`${param}=(-?\\d+\\.?\\d*)`);
        const match = value.match(regex);
        return match ? parseFloat(match[1]) : defaultValue;
    }
}
exports.Filters = Filters;
//# sourceMappingURL=Filters.js.map