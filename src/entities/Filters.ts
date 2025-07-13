import {
    Player,
    Manager,
    Rest,
    validateProperty
} from "../../index";
import {
    Equalizer,
    Karaoke,
    Timescale,
    Tremolo,
    Vibrato,
    Rotation,
    Distortion,
    ChannelMix,
    LowPass,
    HighPass,
    LowPass as LowPassDSPX,
    Normalization,
    Echo
} from "../typings/Interfaces";

export class Filters {
    private player: Player;
    private manager: Manager;
    private rest: Rest;
    private filters: {
        volume?: number;
        equalizer?: Equalizer[];
        karaoke?: Karaoke;
        timescale?: Timescale;
        tremolo?: Tremolo;
        vibrato?: Vibrato;
        rotation?: Rotation;
        distortion?: Distortion;
        channelMix?: ChannelMix;
        lowPass?: LowPass;
        highPass?: HighPass;
        lowPassDSPX?: LowPassDSPX;
        normalization?: Normalization;
        echo?: Echo;
    };

    constructor(player: Player) {
        this.player = player;
        this.rest = player.node.rest;
        this.manager = player.manager;
        this.filters = {
            volume: player.get("Fvolume") || undefined,
            equalizer: player.get("equalizer") || undefined,
            karaoke: player.get("karaoke") || undefined,
            timescale: player.get("timescale") || undefined,
            tremolo: player.get("tremolo") || undefined,
            vibrato: player.get("vibrato") || undefined,
            rotation: player.get("rotation") || undefined,
            distortion: player.get("distortion") || undefined,
            channelMix: player.get("channelMix") || undefined,
            lowPass: player.get("lowPass") || undefined,
            highPass: player.get("highPass") || undefined,
            lowPassDSPX: player.get("lowPassDSPX") || undefined,
            normalization: player.get("normalization") || undefined,
            echo: player.get("echo") || undefined,
        };
    }

    private setFilter(filterName: keyof Filters['filters'], value: any): this {
        this.player.set(filterName, value);
        this.filters[filterName] = value;
        this.updateFiltersFromRest();
        return this;
    }

    public setVolume(volume: number | undefined): this {
        validateProperty(
            volume,
            (value) => value === undefined || (typeof value === 'number' && value >= 0 && value <= 100),
            "Moonlink.js > Filters#setVolume - volume not a number or out of range"
        );
        return this.setFilter("volume", volume);
    }

    public setEqualizer(equalizer: Equalizer[] | undefined): this {
        validateProperty(
            equalizer,
            (value) => {
                if (value === undefined) return true;
                if (!Array.isArray(value)) return false;
                return value.every(eq =>
                    typeof eq.band === 'number' &&
                    typeof eq.gain === 'number'
                );
            },
            "Moonlink.js > Filters#setEqualizer - equalizer not an array of Equalizer objects or undefined"
        );

        return this.setFilter("equalizer", equalizer);
    }

    public setKaraoke(karaoke: Karaoke | undefined): this {
        validateProperty(
            karaoke,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { level, monoLevel, filterBand, filterWidth } = value;
                return (
                    (level === undefined || typeof level === 'number') &&
                    (monoLevel === undefined || typeof monoLevel === 'number') &&
                    (filterBand === undefined || typeof filterBand === 'number') &&
                    (filterWidth === undefined || typeof filterWidth === 'number')
                );
            },
            "Moonlink.js > Filters#setKaraoke - karaoke not a valid Karaoke object or undefined"
        );

        return this.setFilter("karaoke", karaoke);
    }

    public setTimescale(timescale: Timescale | undefined): this {
        validateProperty(
            timescale,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { speed, pitch, rate } = value;
                return (
                    (speed === undefined || typeof speed === 'number') &&
                    (pitch === undefined || typeof pitch === 'number') &&
                    (rate === undefined || typeof rate === 'number')
                );
            },
            "Moonlink.js > Filters#setTimescale - timescale not a valid Timescale object or undefined"
        );

        return this.setFilter("timescale", timescale);
    }

    public setTremolo(tremolo: Tremolo | undefined): this {
        validateProperty(
            tremolo,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { frequency, depth } = value;
                return (
                    (frequency === undefined || typeof frequency === 'number') &&
                    (depth === undefined || typeof depth === 'number')
                );
            },
            "Moonlink.js > Filters#setTremolo - tremolo not a valid Tremolo object or undefined"
        );

        return this.setFilter("tremolo", tremolo);
    }

    public setVibrato(vibrato: Vibrato | undefined): this {
        validateProperty(
            vibrato,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { frequency, depth } = value;
                return (
                    (frequency === undefined || typeof frequency === 'number') &&
                    (depth === undefined || typeof depth === 'number')
                );
            },
            "Moonlink.js > Filters#setVibrato - vibrato not a valid Vibrato object or undefined"
        );

        return this.setFilter("vibrato", vibrato);
    }

    public setRotation(rotation: Rotation | undefined): this {
        validateProperty(
            rotation,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { rotationHz } = value;
                return (
                    rotationHz === undefined || typeof rotationHz === 'number'
                );
            },
            "Moonlink.js > Filters#setRotation - rotation not a valid Rotation object or undefined"
        );

        return this.setFilter("rotation", rotation);
    }

    public setDistortion(distortion: Distortion | undefined): this {
        validateProperty(
            distortion,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { sinOffset, sinScale, cosOffset, cosScale, tanOffset, tanScale, offset, scale } = value;
                return (
                    (sinOffset === undefined || typeof sinOffset === 'number') &&
                    (sinScale === undefined || typeof sinScale === 'number') &&
                    (cosOffset === undefined || typeof cosOffset === 'number') &&
                    (cosScale === undefined || typeof cosScale === 'number') &&
                    (tanOffset === undefined || typeof tanOffset === 'number') &&
                    (tanScale === undefined || typeof tanScale === 'number') &&
                    (offset === undefined || typeof offset === 'number') &&
                    (scale === undefined || typeof scale === 'number')
                );
            },
            "Moonlink.js > Filters#setDistortion - distortion not a valid Distortion object or undefined"
        );

        return this.setFilter("distortion", distortion);
    }

    public setChannelMix(channelMix: ChannelMix | undefined): this {
        validateProperty(
            channelMix,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { leftToLeft, leftToRight, rightToLeft, rightToRight } = value;
                return (
                    (leftToLeft === undefined || typeof leftToLeft === 'number') &&
                    (leftToRight === undefined || typeof leftToRight === 'number') &&
                    (rightToLeft === undefined || typeof rightToLeft === 'number') &&
                    (rightToRight === undefined || typeof rightToRight === 'number')
                );
            },
            "Moonlink.js > Filters#setChannelMix - channelMix not a valid ChannelMix object or undefined"
        );

        return this.setFilter("channelMix", channelMix);
    }

    public setLowPass(lowPass: LowPass | undefined): this {
        validateProperty(
            lowPass,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { smoothing } = value;
                return (
                    smoothing === undefined || typeof smoothing === 'number'
                );
            },
            "Moonlink.js > Filters#setLowPass - lowPass not a valid LowPass object or undefined"
        );

        return this.setFilter("lowPass", lowPass);
    }

    public setHighPass(highPass: HighPass | undefined): this {
        if (highPass !== undefined && !this.player.node.capabilities.has("lavadspx")) {
            this.manager.emit("debug", `Moonlink.js > Filters#setHighPass - Node ${this.player.node.identifier} does not support LavaDSPX filters.`);
            throw new Error("Node does not support LavaDSPX filters.");
        }
        validateProperty(
            highPass,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { cutoffFrequency, boostFactor } = value;
                return (
                    (cutoffFrequency === undefined || (typeof cutoffFrequency === 'number' && cutoffFrequency > 0)) &&
                    (boostFactor === undefined || (typeof boostFactor === 'number' && boostFactor > 0.0))
                );
            },
            "Moonlink.js > Filters#setHighPass - highPass not a valid HighPass object or undefined"
        );

        return this.setFilter("highPass", highPass);
    }

    public setLowPassDSPX(lowPassDSPX: LowPassDSPX | undefined): this {
        if (lowPassDSPX !== undefined && !this.player.node.capabilities.has("lavadspx")) {
            this.manager.emit("debug", `Moonlink.js > Filters#setLowPassDSPX - Node ${this.player.node.identifier} does not support LavaDSPX filters.`);
            throw new Error("Node does not support LavaDSPX filters.");
        }
        validateProperty(
            lowPassDSPX,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { cutoffFrequency, boostFactor } = value;
                return (
                    (cutoffFrequency === undefined || (typeof cutoffFrequency === 'number' && cutoffFrequency > 0)) &&
                    (boostFactor === undefined || (typeof boostFactor === 'number' && boostFactor > 0.0))
                );
            },
            "Moonlink.js > Filters#setLowPassDSPX - lowPassDSPX not a valid LowPassDSPX object or undefined"
        );

        return this.setFilter("lowPassDSPX", lowPassDSPX);
    }

    public setNormalization(normalization: Normalization | undefined): this {
        if (normalization !== undefined && !this.player.node.capabilities.has("lavadspx")) {
            this.manager.emit("debug", `Moonlink.js > Filters#setNormalization - Node ${this.player.node.identifier} does not support LavaDSPX filters.`);
            throw new Error("Node does not support LavaDSPX filters.");
        }
        validateProperty(
            normalization,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { maxAmplitude, adaptive } = value;
                return (
                    (maxAmplitude === undefined || (typeof maxAmplitude === 'number' && maxAmplitude >= 0.0 && maxAmplitude <= 1.0)) &&
                    (adaptive === undefined || typeof adaptive === 'boolean')
                );
            },
            "Moonlink.js > Filters#setNormalization - normalization not a valid Normalization object or undefined"
        );

        return this.setFilter("normalization", normalization);
    }

    public setEcho(echo: Echo | undefined): this {
        if (echo !== undefined && !this.player.node.capabilities.has("lavadspx")) {
            this.manager.emit("debug", `Moonlink.js > Filters#setEcho - Node ${this.player.node.identifier} does not support LavaDSPX filters.`);
            throw new Error("Node does not support LavaDSPX filters.");
        }
        validateProperty(
            echo,
            (value) => {
                if (value === undefined) return true;
                if (typeof value !== 'object') return false;
                const { echoLength, decay } = value;
                return (
                    (echoLength === undefined || (typeof echoLength === 'number' && echoLength > 0.0)) &&
                    (decay === undefined || (typeof decay === 'number' && decay >= 0.0 && decay <= 1.0))
                );
            },
            "Moonlink.js > Filters#setEcho - echo not a valid Echo object or undefined"
        );

        return this.setFilter("echo", echo);
    }

    public resetFilters(): this {
        Object.keys(this.filters).forEach(key => {
            this.setFilter(key as keyof Filters['filters'], undefined);
        });
        return this;
    }

    private async updateFiltersFromRest(): Promise<boolean> {
        const dataToUpdate = {
            guildId: this.player.guildId,
            data: {
                filters: this.filters
            }
        };
        await this.rest.update(dataToUpdate);
    this.manager.emit("filtersUpdate", this.player, this);
    return true;
    }
}
