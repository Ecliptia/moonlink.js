import { 
    Player, 
    Manager, 
    Rest
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
    LowPass 
} from "../typings/Interfaces";

export class MoonlinkFilters {
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
    };

    constructor(player: Player) {
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

    private setFilter(filterName: keyof MoonlinkFilters['filters'], value: any): this {
        this.player.set(filterName, value);
        this.filters[filterName] = value;
        this.updateFiltersFromRest();
        return this;
    }

    public setVolume(volume: number | null): this {
        return this.setFilter("volume", volume);
    }

    public setEqualizer(equalizer: Equalizer[] | null): this {
        return this.setFilter("equalizer", equalizer);
    }

    public setKaraoke(karaoke: Karaoke | null): this {
        return this.setFilter("karaoke", karaoke);
    }

    public setTimescale(timescale: Timescale | null): this {
        return this.setFilter("timescale", timescale);
    }

    public setTremolo(tremolo: Tremolo | null): this {
        return this.setFilter("tremolo", tremolo);
    }

    public setVibrato(vibrato: Vibrato | null): this {
        return this.setFilter("vibrato", vibrato);
    }

    public setRotation(rotation: Rotation | null): this {
        return this.setFilter("rotation", rotation);
    }

    public setDistortion(distortion: Distortion | null): this {
        return this.setFilter("distortion", distortion);
    }

    public setChannelMix(channelMix: ChannelMix | null): this {
        return this.setFilter("channelMix", channelMix);
    }

    public setLowPass(lowPass: LowPass | null): this {
        return this.setFilter("lowPass", lowPass);
    }

    public resetFilters(): this {
        Object.keys(this.filters).forEach(key => {
            this.setFilter(key as keyof MoonlinkFilters['filters'], null);
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
        return true;
    }
}
