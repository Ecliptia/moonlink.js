const Discord = require("discord.js");
const { Manager } = require("../dist/index.js");
require("dotenv").config();

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
  ],
});
client.manager = new Manager({
  nodes: [
    {
      host: "localhost",
      port: 2333,
      password: "youshallnotpass",
    },
  ],
  options: {
    clientName: "moonlink.js blobit/1.0.0",
  },
  sendPayload: (guildId, payload) => {
    console.log("Sending payload to shard");
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));
  },
});

client.on("ready", () => {
  client.manager.init(client.user.id);
  console.log(client.user.tag + " is ready!");
});

client.on("raw", (d) => client.manager.packetUpdate(d));

const prefix = "<@960185850346471505> ";

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "join") {
    const channel = message.member.voice.channel;
    if (!channel)
      return message.reply("You need to join a voice channel first!");

    const player = client.manager.createPlayer({
      guildId: message.guild.id,
      voiceChannelId: channel.id,
      textChannelId: message.channel.id,
    });

    player.connect();
  } else if (command === "search") {
    if (!args.length)
      return message.reply("You need to provide a search query!");
    let req = await client.manager.search({
      query: args.join(" "),
      source: "youtube",
    });

    message.reply({
      content: `Search results for ${args.join(" ")}:\n${req.tracks.map((track, i) => `${i + 1}. **${track.title}**`).join("\n")}`,
    });
  } else if (command === "play") {
    if (!args.length)
      return message.reply("You need to provide a search query!");
    const channel = message.member.voice.channel;
    if (!channel)
      return message.reply("You need to join a voice channel first!");
    const player = client.manager.createPlayer({
      guildId: message.guild.id,
      voiceChannelId: channel.id,
      textChannelId: message.channel.id,
      autoPlay: true,
    });

    if (!player.connected) player.connect();

    let req = await client.manager.search({
      query: args.join(" "),
      source: "youtube",
    });

    player.queue.add(req.tracks[0]);
    if (!player.playing) player.play();
  }
});

client.login(process.env.TOKEN).catch(console.error);
