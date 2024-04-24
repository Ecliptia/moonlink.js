const Discord = require('discord.js');
const { Manager } = require('../dist/index.js');
require('dotenv').config();

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
    ]
});
client.manager = new Manager({
    nodes: [
        {
            host: 'localhost',
            port: 2333,
            password: 'youshallnotpass'
        }
    ],
    options: {
        clientName: 'moonlink.js blobit/1.0.0'
    },
    sendPayload: (payload) => {
        client.ws.send(JSON.stringify(payload));
    }
});

client.on('ready', () => {
    client.manager.init(client.user.id);
    console.log('Bot is ready');
});

client.login(process.env.TOKEN).catch(console.error);