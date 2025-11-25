require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder,
    hyperlink,
    bold,
    italic,
    MessageFlags,
    ComponentType
} = require("discord.js");
const { Manager, Connectors } = require("../");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const nodes = [{
    host: "localhost",
    port: 3000,
    password: "123",
    secure: false,
}];

const manager = new Manager({
    nodes,
    options: {
        database: {
            type: "local",
        },
        autoResume: false,
        resume: true, 
        customFilters: {
            "Reset": {},
            "Alien": "pitch=1.5,vibrato=f=3:d=0.7",
            "Boost": "bass=g=2,treble=g=2",
            "Chipmunk": "speed=1.5,pitch=1.5,rate=1",
            "Darthvader": "speed=0.975,pitch=0.5,rate=1",
            "DeepVibrato": "vibrato=f=2:d=1.0",
            "Distortion": "distortion=sinOffset=0.2:sinScale=0.2:cosOffset=0.2:cosScale=0.2:tanOffset=0.2:tanScale=0.2:offset=0.2:scale=0.2",
            "Fast": "speed=1.5,pitch=1.0,rate=1",
            "FastTremolo": "tremolo=f=5:d=0.5",
            "Flat": {},
            "Ghost": "pitch=0.7,tremolo=f=2:d=0.5,lowpass=10",
            "LightTremolo": "tremolo=f=2:d=0.3",
            "MediumTremolo": "tremolo=f=3:d=0.5",
            "Slowed": "speed=0.8,pitch=0.9,rate=1",
            "Slow": "speed=0.7,pitch=1.0,rate=1",
            "SlowTremolo": "tremolo=f=1:d=0.5",
            "Soft": {},
            "SoftVibrato": "vibrato=f=2:d=0.3",
            "SuperFast": "speed=2.0,pitch=1.0,rate=1",
            "SuperSlow": "speed=0.5,pitch=1.0,rate=1",
            "Television": "pitch=1.2,tremolo=f=4:d=0.4",
            "Trembling": "tremolo=f=8:d=0.8",
            "TrebleBoost": "treble=g=10",
            "Underwater": "lowpass=5,pitch=0.9",
            "Unstable": "vibrato=f=10:d=0.9",
            "Vibrate": "vibrato=f=5:d=0.7",
            "VocalBoost": "bass=g=2"
        }
    }
});

const FILTERS = {
    "Bassboost": { equalizer: [
        { band: 0, gain: 0.6 }, { band: 1, gain: 0.5 }, { band: 2, gain: 0.4 },
        { band: 3, gain: 0.2 }, { band: 4, gain: 0.1 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Classical": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: -0.25 }, { band: 7, gain: -0.25 }, { band: 8, gain: -0.25 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Crunchy": { distortion: { sinOffset: 0.5, sinScale: 0.5, cosOffset: 0.5, cosScale: 0.5, tanOffset: 0.5, tanScale: 0.5, offset: 0.5, scale: 0.5 } },
    "Cut": { equalizer: Array(15).fill(0).map((_, i) => ({ band: i, gain: -0.1 })) },
    "Dance": { equalizer: [
        { band: 0, gain: 0.5 }, { band: 1, gain: 0.25 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.25 }, { band: 11, gain: 0.5 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Earrape": { equalizer: Array(15).fill(0).map((_, i) => ({ band: i, gain: 1.0 })) },
    "Gaming": { equalizer: [
        { band: 0, gain: 0.25 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: -0.25 }, { band: 4, gain: -0.25 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.25 }, { band: 11, gain: 0.25 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Highpass": { equalizer: [
        { band: 0, gain: -0.25 }, { band: 1, gain: -0.25 }, { band: 2, gain: -0.25 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.25 }, { band: 11, gain: 0.25 },
        { band: 12, gain: 0.25 }, { band: 13, gain: 0.25 }, { band: 14, gain: 0.25 }
    ]},
    "Lowpass": { equalizer: [
        { band: 0, gain: 0.25 }, { band: 1, gain: 0.25 }, { band: 2, gain: 0.25 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: -0.25 }, { band: 11, gain: -0.25 },
        { band: 12, gain: -0.25 }, { band: 13, gain: -0.25 }, { band: 14, gain: -0.25 }
    ]},
    "Metal": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.1 }, { band: 2, gain: 0.1 },
        { band: 3, gain: 0.15 }, { band: 4, gain: 0.13 }, { band: 5, gain: 0.1 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.125 }, { band: 8, gain: 0.175 },
        { band: 9, gain: 0.175 }, { band: 10, gain: 0.125 }, { band: 11, gain: 0.125 },
        { band: 12, gain: 0.1 }, { band: 13, gain: 0.075 }, { band: 14, gain: 0.0 }
    ]},
    "Midboost": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.25 }, { band: 4, gain: 0.25 }, { band: 5, gain: 0.25 },
        { band: 6, gain: 0.25 }, { band: 7, gain: 0.25 }, { band: 8, gain: 0.25 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Party": { equalizer: [
        { band: 0, gain: 0.3 }, { band: 1, gain: 0.3 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.3 }, { band: 11, gain: 0.3 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Pop": { equalizer: [
        { band: 0, gain: -0.02 }, { band: 1, gain: -0.01 }, { band: 2, gain: 0.08 },
        { band: 3, gain: 0.1 }, { band: 4, gain: 0.15 }, { band: 5, gain: 0.1 },
        { band: 6, gain: 0.03 }, { band: 7, gain: -0.02 }, { band: 8, gain: -0.035 },
        { band: 9, gain: -0.05 }, { band: 10, gain: -0.05 }, { band: 11, gain: -0.05 },
        { band: 12, gain: -0.05 }, { band: 13, gain: -0.05 }, { band: 14, gain: -0.05 }
    ]},
    "Radio": { equalizer: [
        { band: 0, gain: -0.25 }, { band: 1, gain: -0.25 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.25 },
        { band: 6, gain: 0.25 }, { band: 7, gain: 0.25 }, { band: 8, gain: 0.25 },
        { band: 9, gain: 0.25 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: -0.25 }, { band: 14, gain: -0.25 }
    ]},
    "Rock": { equalizer: [
        { band: 0, gain: 0.3 }, { band: 1, gain: 0.25 }, { band: 2, gain: 0.2 },
        { band: 3, gain: 0.1 }, { band: 4, gain: 0.05 }, { band: 5, gain: -0.05 },
        { band: 6, gain: -0.15 }, { band: 7, gain: -0.2 }, { band: 8, gain: -0.1 },
        { band: 9, gain: 0.1 }, { band: 10, gain: 0.15 }, { band: 11, gain: 0.2 },
        { band: 12, gain: 0.25 }, { band: 13, gain: 0.3 }, { band: 14, gain: 0.35 }
    ]},
    "Treblebass": { equalizer: [
        { band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 2, gain: 0.67 },
        { band: 3, gain: 0.0 }, { band: 4, gain: -0.5 }, { band: 5, gain: 0.15 },
        { band: 6, gain: -0.45 }, { band: 7, gain: 0.23 }, { band: 8, gain: 0.35 },
        { band: 9, gain: 0.45 }, { band: 10, gain: 0.55 }, { band: 11, gain: 0.6 },
        { band: 12, gain: 0.55 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Jazz": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.2 }, { band: 4, gain: 0.2 }, { band: 5, gain: 0.2 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.2 }, { band: 10, gain: 0.2 }, { band: 11, gain: 0.2 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "LeftChannelOnly": { channelMix: { leftToLeft: 1.0, leftToRight: 0.0, rightToLeft: 0.0, rightToRight: 0.0 } },
    "Nightcore": { timescale: { speed: 1.2, pitch: 1.2, rate: 1 } },
    "NightcoreReverb": { timescale: { speed: 1.2, pitch: 1.2, rate: 1 }, lowPass: { smoothing: 15 } },
    "OldRecord": { lowPass: { smoothing: 15 }, distortion: { offset: 0.1, scale: 0.1 }, timescale: { speed: 0.95 }, vibrato: { frequency: 0.5, depth: 0.1 } },
    "Phone": { equalizer: [
        { band: 0, gain: -0.5 }, { band: 1, gain: -0.5 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.25 }, { band: 4, gain: 0.5 }, { band: 5, gain: 0.75 },
        { band: 6, gain: 0.5 }, { band: 7, gain: 0.25 }, { band: 8, gain: 0.0 },
        { band: 9, gain: -0.25 }, { band: 10, gain: -0.5 }, { band: 11, gain: -0.5 },
        { band: 12, gain: -0.5 }, { band: 13, gain: -0.5 }, { band: 14, gain: -0.5 }
    ]},
    "PitchDown": { timescale: { speed: 1.0, pitch: 0.8, rate: 1 } },
    "PitchUp": { timescale: { speed: 1.0, pitch: 1.2, rate: 1 } },
    "Radio": { lowPass: { smoothing: 10 }, equalizer: [
        { band: 0, gain: -0.5 }, { band: 1, gain: -0.5 }, { band: 2, gain: -0.25 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.25 }, { band: 5, gain: 0.5 },
        { band: 6, gain: 0.25 }, { band: 7, gain: 0.0 }, { band: 8, gain: -0.25 },
        { band: 9, gain: -0.5 }, { band: 10, gain: -0.5 }, { band: 11, gain: -0.5 },
        { band: 12, gain: -0.5 }, { band: 13, gain: -0.5 }, { band: 14, gain: -0.5 }
    ]},
    "RightChannelOnly": { channelMix: { leftToLeft: 0.0, leftToRight: 1.0, rightToLeft: 0.0, rightToRight: 1.0 } },
    "Robot": { timescale: { pitch: 0.8 }, tremolo: { frequency: 5, depth: 0.8 } },
    "Rock": { equalizer: [
        { band: 0, gain: 0.25 }, { band: 1, gain: 0.0 }, { band: 2, gain: -0.25 },
        { band: 3, gain: -0.25 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.25 },
        { band: 6, gain: 0.25 }, { band: 7, gain: 0.0 }, { band: 8, gain: -0.25 },
        { band: 9, gain: -0.25 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.25 },
        { band: 12, gain: 0.25 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Slow": { timescale: { speed: 0.7, pitch: 1.0, rate: 1 } },
    "Slowed": { timescale: { speed: 0.8, pitch: 1, rate: 1 } },
    "Speech": { equalizer: [
        { band: 0, gain: -0.25 }, { band: 1, gain: -0.25 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.25 }, { band: 4, gain: 0.5 }, { band: 5, gain: 0.25 },
        { band: 6, gain: 0.0 }, { band: 7, gain: -0.25 }, { band: 8, gain: -0.25 },
        { band: 9, gain: -0.25 }, { band: 10, gain: -0.25 }, { band: 11, gain: -0.25 },
        { band: 12, gain: -0.25 }, { band: 13, gain: -0.25 }, { band: 14, gain: -0.25 }
    ]},
    "Stutter": { tremolo: { frequency: 10, depth: 0.8 } },
    "SuperFast": { timescale: { speed: 2.0, pitch: 1.0, rate: 1 } },
    "SuperSlow": { timescale: { speed: 0.5, pitch: 1.0, rate: 1 } },
    "SwapChannels": { channelMix: { leftToLeft: 0.0, leftToRight: 1.0, rightToLeft: 1.0, rightToRight: 0.0 } },
    "Trebleboost": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.25 }, { band: 10, gain: 0.5 }, { band: 11, gain: 0.75 },
        { band: 12, gain: 0.5 }, { band: 13, gain: 0.25 }, { band: 14, gain: 0.0 }
    ]},
    "Underwater": { lowPass: { smoothing: 20 } },
    "Vaporwave": { timescale: { speed: 0.8, pitch: 0.8, rate: 1 } },
    "VaporwaveReverb": { timescale: { speed: 0.8, pitch: 0.8, rate: 1 }, lowPass: { smoothing: 15 } },
    "Vibrato": { vibrato: { frequency: 2, depth: 0.5 } },
    "Vocalboost": { equalizer: [
        { band: 0, gain: -0.25 }, { band: 1, gain: -0.25 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.25 }, { band: 4, gain: 0.5 }, { band: 5, gain: 0.75 },
        { band: 6, gain: 0.5 }, { band: 7, gain: 0.25 }, { band: 8, gain: 0.0 },
        { band: 9, gain: -0.25 }, { band: 10, gain: -0.25 }, { band: 11, gain: -0.25 },
        { band: 12, gain: -0.25 }, { band: 13, gain: -0.25 }, { band: 14, gain: -0.25 }
    ]},
    "Wobbly": { vibrato: { frequency: 5, depth: 1.0 } },
    "Echo": { timescale: { rate: 0.9 }, lowPass: { smoothing: 10 } },
    "Flanger": { tremolo: { frequency: 0.1, depth: 0.5 }, vibrato: { frequency: 0.1, depth: 0.5 } },
    "Gargle": { tremolo: { frequency: 10, depth: 0.9 } },
    "Pulsator": { tremolo: { frequency: 4, depth: 0.7 } },
    "Invert": { channelMix: { leftToLeft: -1.0, leftToRight: 0.0, rightToLeft: 0.0, rightToRight: -1.0 } },
    "Monotone": { equalizer: Array(15).fill(0).map((_, i) => ({ band: i, gain: 0.0 })) },
    "SoftBass": { equalizer: [
        { band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.1 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "VocalRemover": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: -0.25 }, { band: 4, gain: -0.25 }, { band: 5, gain: -0.25 },
        { band: 6, gain: -0.25 }, { band: 7, gain: -0.25 }, { band: 8, gain: -0.25 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "8D": { rotation: { rotationHz: 0.2 } },
    "BassBoostHigh": { equalizer: [
        { band: 0, gain: 0.75 }, { band: 1, gain: 0.65 }, { band: 2, gain: 0.55 },
        { band: 3, gain: 0.35 }, { band: 4, gain: 0.2 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "BassBoostLow": { equalizer: [
        { band: 0, gain: 0.3 }, { band: 1, gain: 0.25 }, { band: 2, gain: 0.2 },
        { band: 3, gain: 0.1 }, { band: 4, gain: 0.05 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.0 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "Electronic": { equalizer: [
        { band: 0, gain: 0.35 }, { band: 1, gain: 0.35 }, { band: 2, gain: 0.1 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.1 },
        { band: 6, gain: 0.2 }, { band: 7, gain: 0.35 }, { band: 8, gain: 0.35 },
        { band: 9, gain: 0.35 }, { band: 10, gain: 0.35 }, { band: 11, gain: 0.35 },
        { band: 12, gain: 0.35 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ]},
    "FullBass": { equalizer: [
        { band: 0, gain: 0.85 }, { band: 1, gain: 0.75 }, { band: 2, gain: 0.65 },
        { band: 3, gain: 0.45 }, { band: 4, gain: 0.25 }, { band: 5, gain: 0.0 },
        { band: 6, gain: -0.25 }, { band: 7, gain: -0.45 }, { band: 8, gain: -0.55 },
        { band: 9, gain: -0.55 }, { band: 10, gain: -0.55 }, { band: 11, gain: -0.55 },
        { band: 12, gain: -0.55 }, { band: 13, gain: -0.55 }, { band: 14, gain: -0.55 }
    ]},
    "FullTreble": { equalizer: [
        { band: 0, gain: -0.6 }, { band: 1, gain: -0.6 }, { band: 2, gain: -0.6 },
        { band: 3, gain: -0.4 }, { band: 4, gain: -0.2 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.15 }, { band: 7, gain: 0.3 }, { band: 8, gain: 0.45 },
        { band: 9, gain: 0.6 }, { band: 10, gain: 0.75 }, { band: 11, gain: 0.75 },
        { band: 12, gain: 0.75 }, { band: 13, gain: 0.75 }, { band: 14, gain: 0.75 }
    ]},
    "Karaoke": { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
    "Lofi": { equalizer: [
        { band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: -0.1 }, { band: 5, gain: -0.15 },
        { band: 6, gain: -0.2 }, { band: 7, gain: -0.1 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.1 }, { band: 10, gain: 0.15 }, { band: 11, gain: 0.2 },
        { band: 12, gain: 0.1 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 }
    ], lowPass: { smoothing: 20 } },
    "Muffled": { lowPass: { smoothing: 25 } },
    "NightcoreSlow": { timescale: { speed: 1.1, pitch: 1.1, rate: 1 } },
    "Reverse": { timescale: { speed: -1.0, pitch: 1.0, rate: 1 } },
    "SlowedReverb": { timescale: { speed: 0.85, pitch: 0.85, rate: 1 }, lowPass: { smoothing: 15 } },
    "TrebleBoostHigh": { equalizer: [
        { band: 0, gain: 0.0 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.0 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.15 },
        { band: 9, gain: 0.35 }, { band: 10, gain: 0.55 }, { band: 11, gain: 0.75 },
        { band: 12, gain: 0.65 }, { band: 13, gain: 0.45 }, { band: 14, gain: 0.25 }
    ]},
};

manager.use(new Connectors.DiscordJs(), client);

const playerMessages = new Map();
const playerIntervals = new Map();

function formatDuration(ms) {
    if (ms <= 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createProgressBar(current, total, size = 20) {
    if (current > total || current < 0) current = 0;
    const percentage = total > 0 ? current / total : 0;
    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;
    const progressText = "<:AZ_5blue:1438717727463178250>".repeat(progress);
    const handle = "<a:greenfrog_dw:1438675937414615100>";
    const emptyProgressText = "<:AZ_8white:1438717934443958406>".repeat(emptyProgress);
    return `${progressText}${handle}${emptyProgressText}`;
}

manager.on('debug', console.log);

async function sendPaginatedEmbed(interaction, title, tracks, isQueue) {
    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
    let currentPage = 1;

    const generateEmbed = (page) => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const currentTracks = tracks.slice(start, end);

        let description = currentTracks.map((track, index) => {
            const trackNumber = start + index + 1;
            const trackTitle = hyperlink(track.title, track.uri);
            if (isQueue && page === 1 && index === 0) {
                return `${bold(`${trackNumber}. ${trackTitle}`)} - ${italic(track.author)}`;
            }
            return `${trackNumber}. ${trackTitle} - ${italic(track.author)}`;
        }).join("\n");

        if (!description) {
            description = "Nothing to show here.";
        }

        return new EmbedBuilder()
            .setColor("#00BFFF") 
            .setTitle(isQueue ? "🎶 Your Epic Queue!" : "📜 Blast from the Past!")
            .setDescription(description)
            .setFooter({ text: `Page ${page} of ${totalPages} | ${isQueue ? "Keep the good vibes rollin'!" : "Reliving those sweet tunes!"}` });
    };

    const getButtons = (page) => new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('paginate_prev').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(page === 1),
        new ButtonBuilder().setCustomId('paginate_next').setEmoji('➡️').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages)
    );

    const replyOptions = {
        embeds: [generateEmbed(currentPage)],
        components: [getButtons(currentPage)],
        flags: [MessageFlags.Ephemeral],
        fetchReply: true
    };

    const message = await interaction.reply(replyOptions);

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000
    });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            return i.reply({ content: "You can't use these buttons.", flags: [MessageFlags.Ephemeral] });
        }
        if (i.customId === 'paginate_prev') {
            currentPage--;
        } else if (i.customId === 'paginate_next') {
            currentPage++;
        }
        await i.update({
            embeds: [generateEmbed(currentPage)],
            components: [getButtons(currentPage)]
        });
    });

    collector.on('end', () => message.edit({ components: [] }).catch(() => {}));
}

async function sendPaginatedFilterMenu(interaction, allFilters, initialActiveFilters) {
    const PAGE_SIZE = 24;
    const filterNames = Object.keys(allFilters);
    const totalPages = Math.max(1, Math.ceil(filterNames.length / PAGE_SIZE));
    let currentPage = 1;

    let currentSelectedFilters = new Set(initialActiveFilters);

    const generateFilterComponents = (page) => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const currentFilterNames = filterNames.slice(start, end);

        const filterOptions = [
            { label: '🚫 Clear Selection (This Page)', value: '__clear_page__', emoji: '🚫' },
            ...currentFilterNames.map(f => ({
                label: f,
                value: f,
                default: currentSelectedFilters.has(f)
            }))
        ].slice(0, 25);

        const filterMenu = new StringSelectMenuBuilder()
            .setCustomId("player_filters_select")
            .setPlaceholder("Select filters to enable/disable")
            .setMinValues(1)
            .setMaxValues(filterOptions.length)
            .addOptions(filterOptions);

        const navigationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('filter_prev_page').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(page === 1),
            new ButtonBuilder().setCustomId('filter_next_page').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages)
        );

        const applyButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('apply_filters').setLabel('Apply Filters').setEmoji('✨').setStyle(ButtonStyle.Success)
        );

        return {
            components: [new ActionRowBuilder().addComponents(filterMenu), navigationButtons, applyButton],
            embeds: [new EmbedBuilder()
                .setColor("#A020F0") 
                .setTitle("🎚️ Sound Lab: Filters Edition!")
                .setDescription(`Ready to tweak the tunes? 🎧 Dive into these awesome audio filters! Pick your favorites from the menu below to make your music sound just right. Don't forget to hit 'Apply Filters' when you're done!\n\n**Current Page:** ${page} of ${totalPages}\n**Selected Filters:** ${currentSelectedFilters.size > 0 ? Array.from(currentSelectedFilters).map(f => `\`${f}\``).join(', ') : 'None'}`)
                .setFooter({ text: "Pro tip: Experiment with filters like mixing ice cream flavors – find your perfect combo! 🍦" })
                .setTimestamp()
            ],
            flags: [MessageFlags.Ephemeral]
        };
    };

    const response = await interaction.reply({ ...generateFilterComponents(currentPage), fetchReply: true });

    const collector = response.createMessageComponentCollector({
        time: 120000
    });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            return i.reply({ content: "You can't use these controls.", flags: [MessageFlags.Ephemeral] });
        }

        if (i.isButton()) {
            if (i.customId === 'filter_prev_page') {
                currentPage--;
                await i.update(generateFilterComponents(currentPage));
            } else if (i.customId === 'filter_next_page') {
                currentPage++;
                await i.update(generateFilterComponents(currentPage));
            } else if (i.customId === 'apply_filters') {
                const player = manager.players.get(interaction.guildId);
                if (!player) {
                    await i.update({ 
                        embeds: [new EmbedBuilder()
                            .setColor("#ED4245")
                            .setTitle("Uh oh! Player MIA! 🚨")
                            .setDescription("Bummer! Looks like the music player isn't around anymore, or maybe it just packed up and left. Can't play tunes without it! 🤷‍♀️")
                            .setTimestamp()
                        ],
                        components: []
                    });
                    collector.stop();
                    return;
                }

                player.filters.reset();
                const filtersToApply = Array.from(currentSelectedFilters).filter(f => f !== "Reset");

                if (filtersToApply.length === 0) {
                    player.set('active_filters', []);
                } else {
                    for (const filterName of filtersToApply) {
                        // Tentar habilitar filtro do customFilters ou FILTERS complexos
                        if (player.filters.available.includes(filterName)) {
                            player.filters.enable(filterName);
                        } else {
                            // Se não estiver nos customFilters, aplicar manualmente do FILTERS
                            const filterData = allFilters[filterName];
                            if (filterData) {
                                Object.assign(player.filters, filterData);
                            }
                        }
                    }
                    player.set('active_filters', filtersToApply);
                }
                await player.filters.apply();
                await updatePlayerMessage(player);
                
                const filterList = filtersToApply.length > 0 
                    ? filtersToApply.map(f => `\`${f}\``).join(', ')
                    : 'None';
                
                await i.update({ 
                    embeds: [new EmbedBuilder()
                        .setColor("#32CD32") 
                        .setTitle("🎉 Filters Activated! Let's Jam!")
                        .setDescription(`Boom! 💥 Your music just got a major upgrade! These awesome filters are now doing their magic. Get ready for some seriously cool sounds!`)
                        .addFields(
                            { name: "Active Filters", value: filterList, inline: false },
                            { name: "Total Filters", value: `${filtersToApply.length}`, inline: true },
                            { name: "Status", value: "✓ Applied", inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: "Keep the party going! These filters are here to stay until you change 'em. 🎶" })
                    ],
                    components: []
                });
                collector.stop();
            }
        } else if (i.isStringSelectMenu() && i.customId === 'player_filters_select') {
            const currentFilterNamesOnPage = filterNames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
            
            if (i.values.includes('__clear_page__')) {
                currentFilterNamesOnPage.forEach(f => currentSelectedFilters.delete(f));
            } else {
                currentFilterNamesOnPage.forEach(f => currentSelectedFilters.delete(f));
                i.values.forEach(f => {
                    if (f !== '__clear_page__') currentSelectedFilters.add(f);
                });
            }
            
            await i.update(generateFilterComponents(currentPage));
        }
    });

    collector.on('end', () => {
        response.edit({ components: [] }).catch(() => {});
    });
}

async function buildPlayerUI(player) {
    const track = player.current;
    if (!track) {
        return {
            embeds: [new EmbedBuilder().setColor("#ED4245").setDescription("Queue has ended.").setTimestamp()],
            components: []
        };
    }

    let progressField;
    if (track.isStream) {
        progressField = `<a:cat:1442196058536153259> 🔴 **AO VIVO** (${formatDuration(player.current.position)})`;
    } else {
        const progress = createProgressBar(player.current.position, track.duration);
        const time = `${formatDuration(player.current.position)} / ${formatDuration(track.duration)}`;
        progressField = `${progress}  ${time}`;
    }

    const nextTrack = player.queue.first;

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Now Playing", iconURL: "https://cdn.discordapp.com/emojis/1403376432855384084.webp?size=128&animated=true" })
        .setTitle(track.title)
        .setURL(track.uri)
        .setThumbnail(track.thumbnail)
        .setColor("#2B2D31")
        .setDescription(
            `› <:w4_stars:1438720195848835073> ${bold("Author:")} ${italic(track.author)}
` +
            `› <:Boycurious:908830239944228864> ${bold("Requested by:")} ${track.requester}
` +
            `› <a:w4_song:1438718588197273691> ${bold("Next:")} ${nextTrack ? hyperlink(nextTrack.title, nextTrack.uri) : "Nothing"}`
        )
        .addFields({ name: "Progress", value: progressField, inline: false });

    const activeFilters = player.get('active_filters');
    if (activeFilters && activeFilters.length > 0) {
        embed.addFields({ name: "Filters", value: activeFilters.map(f => `${f}`).join(', '), inline: false });
    }

    embed.setTimestamp();

    const playPauseButton = new ButtonBuilder().setCustomId("player_play_pause").setEmoji(player.paused ? "▶️" : "⏸️").setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary);
    const backButton = new ButtonBuilder().setCustomId("player_back").setEmoji("⏮️").setStyle(ButtonStyle.Primary).setDisabled(player.previous.length === 0);
    const skipButton = new ButtonBuilder().setCustomId("player_skip").setEmoji("⏭️").setStyle(ButtonStyle.Primary);
    const stopButton = new ButtonBuilder().setCustomId("player_stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger);
    const volumeButton = new ButtonBuilder().setCustomId("player_volume").setEmoji("🔊").setStyle(ButtonStyle.Primary);

    const settingsMenu = new StringSelectMenuBuilder().setCustomId("player_settings").setPlaceholder("⚙️ Settings & More").addOptions([
        { label: "Show Queue", description: "Display the server's song queue.", value: "show_queue", emoji: "🎶" },
        { label: "Show History", description: "Display the recently played songs.", value: "show_history", emoji: "📜" },
        { label: "Filters", description: "Apply audio filters to the music.", value: "show_filters", emoji: "🎛️" },
        { label: "Loop: Off", description: "Turn off looping.", value: "loop_off", emoji: "❌" },
        { label: "Loop: Track", description: "Loop the current track.", value: "loop_track", emoji: "🔂" },
        { label: "Loop: Queue", description: "Loop the entire queue.", value: "loop_queue", emoji: "🔁" },
    ]);

    const row1 = new ActionRowBuilder().addComponents(backButton, playPauseButton, skipButton, stopButton, volumeButton);
    const row2 = new ActionRowBuilder().addComponents(settingsMenu);

    return { embeds: [embed], components: [row1, row2] };
}

async function updatePlayerMessage(player) {
    const message = playerMessages.get(player.guildId);
    if (!message) return;
    try {
        const ui = await buildPlayerUI(player);
        await message.edit(ui);
    } catch (error) {
        if (error.code === 10008) console.error("[UI Error] Player message not found, cleaning up.");
        else console.error(`[UI Error] Failed to edit player message:`, error);
        cleanupPlayer(player.guildId);
    }
}

function cleanupPlayer(guildId) {
    const interval = playerIntervals.get(guildId);
    if (interval) clearInterval(interval);
    playerIntervals.delete(guildId);
    playerMessages.delete(guildId);
}

manager.on("trackStart", async (player, track) => {
    const oldMessage = playerMessages.get(player.guildId);
    if (oldMessage) oldMessage.delete().catch(() => {});

    const newUI = await buildPlayerUI(player);
    const channel = await client.channels.fetch(player.textChannelId).catch(() => null);
    if (!channel) {
        console.error(`[trackStart] Could not find text channel with ID ${player.textChannelId} for guild ${player.guildId}`);
        return;
    }
    const newMessage = await channel.send({ ...newUI, flags: [MessageFlags.SuppressNotifications] });
    playerMessages.set(player.guildId, newMessage);

    const existingInterval = playerIntervals.get(player.guildId);
    if (existingInterval) clearInterval(existingInterval);

    const interval = setInterval(async () => {
        if (player.playing && !player.paused) await updatePlayerMessage(player);
    }, 5000);
    playerIntervals.set(player.guildId, interval);
});

manager.on("queueEnd", async (player) => {
    const message = playerMessages.get(player.guildId);
    if (message) {
        const ui = await buildPlayerUI(player);
        await message.edit(ui).catch(() => {});
    }
    cleanupPlayer(player.guildId);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
manager.on("nodeCreate", (node) => {
    console.log(`Node "${node.identifier}" connecteddddddddddddddddddddddddddd.`);
});
client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName !== "play") return;
            if (!interaction.member.voice.channel) return interaction.reply({ content: "Whoa there! 🛑 You gotta be in a voice channel for me to play some tunes! Hop in one and try again!", flags: [MessageFlags.Ephemeral] });
            await interaction.deferReply();
            const player = manager.players.create({ guildId: interaction.guildId, voiceChannelId: interaction.member.voice.channelId, textChannelId: interaction.channel.id, autoPlay: true, selfDeaf: false });
            const wasPlaying = player.playing;
            if (!player.connected) await player.connect();
            const searchResult = await manager.search({ query: interaction.options.getString("query"), requester: interaction.user });
            if (searchResult.isEmpty || searchResult.isError) return interaction.editReply({ content: "Oops! 😬 Couldn't find any tracks for that. Maybe try a different search? My music radar isn't perfect, ya know!", flags: [MessageFlags.Ephemeral] });
            if (searchResult.isPlaylist) {
                player.queue.add(searchResult.tracks);
                await interaction.editReply({ content: `Sweet! 🎉 Just added the playlist **${searchResult.playlistName}** with ${searchResult.tracks.length} awesome tracks to the queue! Get ready to groove!` });
            } else {
                player.queue.add(searchResult.tracks[0]);
                await interaction.editReply({ content: `Nice pick! 👍 **${searchResult.tracks[0].title}** is now chilling in the queue, waiting for its turn to shine!` });
            }
            if (!wasPlaying) await player.play();
            return;
        }

        const player = manager.players.get(interaction.guildId);
        if (!player) {
            cleanupPlayer(interaction.guildId);
            return interaction.reply({ content: "Uh oh! 😟 Looks like the music player went poof! Or maybe it just stopped. Try starting a new one!", flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "player_play_pause":
                    await interaction.deferUpdate();
                    player.paused ? await player.resume() : await player.pause();
                    await updatePlayerMessage(player);
                    break;
                case "player_skip":
                    await interaction.deferUpdate();
                    await player.skip();
                    break;
                case "player_back":
                    await interaction.deferUpdate();
                    await player.back();
                    break;
                case "player_stop":
                    const message = playerMessages.get(interaction.guildId);
                    if (message) {
                        const stoppedEmbed = new EmbedBuilder().setColor("#ED4245").setDescription("Aww, man! The music stopped. Guess it's time for a break... or maybe some ice cream? 🍦");
                        await message.edit({ embeds: [stoppedEmbed], components: [] }).catch(() => {});
                    }
                    cleanupPlayer(interaction.guildId);
                    await player.destroy();
                    break;
                case "player_volume":
                    const volumeMenu = new StringSelectMenuBuilder().setCustomId("player_volume_select").setPlaceholder("Select a volume level").addOptions(Array.from({ length: 11 }, (_, i) => ({ label: `${100 - (i * 10)}%`, value: (100 - (i * 10)).toString() })));
                    await interaction.reply({ components: [new ActionRowBuilder().addComponents(volumeMenu)], flags: [MessageFlags.Ephemeral] });
                    break;
            }
        }

        if (interaction.isStringSelectMenu()) {
            switch (interaction.customId) {
                case "player_settings":
                    const value = interaction.values[0];
                    if (value === "show_queue") {
                        await sendPaginatedEmbed(interaction, "🎶 Queue", player.queue, true);
                    } else if (value === "show_history") {
                        await sendPaginatedEmbed(interaction, "📜 History", [...player.previous].reverse(), false);
                    } else if (value === "show_filters") {
                        const activeFilters = player.get('active_filters') || [];
                        await sendPaginatedFilterMenu(interaction, FILTERS, activeFilters);
                    } else if (value.startsWith("loop_")) {
                        await interaction.deferUpdate();
                        player.setLoop(value.split("_")[1]);
                        await updatePlayerMessage(player);
                    }
                    break;
                case "player_volume_select":
                    await interaction.deferUpdate();
                    player.setVolume(parseInt(interaction.values[0], 10));
                    await interaction.followUp({ content: `Alright! 🔊 Volume cranked to ${interaction.values[0]}%! Hope your ears are ready for this! 🤘`, flags: [MessageFlags.Ephemeral] });
                    break;
            }
        }
    } catch (error) {
        console.error("[Interaction Error]", error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Whoops! 😅 Something went wrong on my end. My circuits are a bit tangled. Try that again, maybe?', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        } else {
            await interaction.reply({ content: 'Whoops! 😅 Something went wrong on my end. My circuits are a bit tangled. Try that again, maybe?', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        }
    }
});

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
(async () => {
    try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {
                body: [
                    new SlashCommandBuilder()
                        .setName("play")
                        .setDescription("Plays a song or playlist")
                        .addStringOption(option =>
                            option.setName("query").setDescription("The song URL or search query").setRequired(true)
                        ),
                ],
            }
        );
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

client.login(process.env.BOT_TOKEN);