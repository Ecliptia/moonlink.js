const Discord = require('discord.js');
const { Manager } = require('../dist/index.js');
require('dotenv').config();

console.log(require('../dist/index.js'));

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
    sendPayload: (guildId, payload) => {
        console.log('Sending payload to shard');
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(JSON.parse(payload));
      },
    });

client.on('ready', () => {
    client.manager.init(client.user.id);
    console.log('Bot is ready');
});

client.on('raw', (d) => client.manager.packetUpdate(d));

client.on('messageCreate', async (message) => {
    console.log(message.content);
    if (message.author.bot) return;
    if (!message.content.startsWith('<@960185850346471505> join')) return;
    
    const channel = message.member.voice.channel;
    if (!channel) return message.reply('You need to join a voice channel first!');

    const player = client.manager.createPlayer({
        guildId: message.guild.id,
        voiceChannelId: channel.id,
        textChannelId: message.channel.id
    });

    player.connect();
});

client.login(process.env.TOKEN).catch(console.error);