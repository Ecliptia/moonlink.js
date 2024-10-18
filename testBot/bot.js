const Discord = require("discord.js");
const { Manager } = require("../dist/index.js");
require("dotenv").config();

const client = new Discord.Client({
  intents: 131071,
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
    NodeLinkFeatures: true,
    previousInArray: true,
  },
  sendPayload: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));
  },
});

client.manager.on("debug", (message) => console.log("[DEBUG]", message));
client.manager.on("trackEnd", (player, track) => {
  client.channels.cache.get(player.textChannelId).send(`Track ${track.title} ended!`);
});
client.on("ready", () => {
  client.manager.init(client.user.id);
  console.log(client.user.tag + " is ready!");
});

client.on("raw", (d) => client.manager.packetUpdate(d));

function createPlayerButtons() {
  const buttons = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('play')
        .setLabel('▶️ Play')
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setCustomId('pause')
        .setLabel('⏸️ Pause')
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.ButtonBuilder()
        .setCustomId('stop')
        .setLabel('⏹️ Stop')
        .setStyle(Discord.ButtonStyle.Danger),
      new Discord.ButtonBuilder()
        .setCustomId('volume_up')
        .setLabel('🔊 Volume +')
        .setStyle(Discord.ButtonStyle.Secondary),
      new Discord.ButtonBuilder()
        .setCustomId('volume_down')
        .setLabel('🔉 Volume -')
        .setStyle(Discord.ButtonStyle.Secondary)
    );

  const secondaryButtons = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('shuffle')
        .setLabel('🔀 Shuffle')
        .setStyle(Discord.ButtonStyle.Secondary),
      new Discord.ButtonBuilder()
        .setCustomId('loop')
        .setLabel('🔁 Loop')
        .setStyle(Discord.ButtonStyle.Secondary),
      new Discord.ButtonBuilder()
        .setCustomId('skip')
        .setLabel('⏭️ Skip')
        .setStyle(Discord.ButtonStyle.Secondary)
    );

  return [buttons, secondaryButtons];
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const player = client.manager.players.get(message.guild.id);

  if (message.content.toLowerCase() === "?c") {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply("You need to join a voice channel first!");

    const player = client.manager.createPlayer({
      guildId: message.guild.id,
      voiceChannelId: channel.id,
      textChannelId: message.channel.id,
    });

    if (!player.connected) {
      player.connect({ setDeaf: true });
    }

    await message.channel.send({
      content: "🎵 **Music Player Controls** 🎵",
      components: createPlayerButtons(),
    });
  }

  if (message.content.startsWith("?")) {
    const [command, ...args] = message.content.slice(1).trim().split(/ +/);
    switch (command) {
      case 'play':
        if (!args[0]) return message.reply("You need to provide a song or URL!");
        const player = client.manager.createPlayer({
          guildId: message.guild.id,
          voiceChannelId: message.member.voice.channelId,
          textChannelId: message.channel.id,
          autoPlay: true,
        });
        
        if (!player.connected) {
          player.connect({ setDeaf: true });
        }

        const searchResult = await client.manager.search({
          query: args.join(" ")
        })

        if (!searchResult.tracks.length) return message.reply("No results found.");
        
        player.queue.add(searchResult.tracks[0]);
        if (!player.playing) player.play();
        await message.reply(`Playing track: ${searchResult.tracks[0].title}`);
        break;

      case 'pause':
        if (!player.playing) return message.reply("No music is currently playing.");
        player.pause();
        await message.reply("Music paused!");
        break;

      case 'resume':
        if (!player.paused) return message.reply("Music is not paused.");
        player.resume();
        await message.reply("Music resumed!");
        break;

      case 'stop':
        player.stop();
        await message.reply("Music stopped!");
        break;

      case 'skip':
        if (!player.queue.size) return message.reply("No more songs in the queue to skip.");
        await player.skip();
        await message.reply("Skipped to the next track!");
        break;

      case 'volume':
        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) return message.reply("Volume must be a number between 0 and 100.");
        player.setVolume(volume);
        await message.reply(`Volume set to ${volume}`);
        break;

      case 'shuffle':
        player.shuffle();
        await message.reply("Queue shuffled!");
        break;

      case 'loop':
        const loopModes = ["off", "track", "queue"];
        const currentLoop = player.loop;
        const nextLoop = loopModes[(loopModes.indexOf(currentLoop) + 1) % loopModes.length];
        player.setLoop(nextLoop);
        await message.reply(`Loop mode set to ${nextLoop}`);
        break;

      default:
        await message.reply("Unknown command.");
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const player = client.manager.players.get(interaction.guild.id);
  if (!player) return interaction.reply({ content: "No active player!", ephemeral: true });

  switch (interaction.customId) {
    case 'play':
      if (!player.playing) player.play();
      await interaction.reply("▶️ Music resumed!");
      break;
    case 'pause':
      player.pause();
      await interaction.reply("⏸️ Music paused!");
      break;
    case 'stop':
      player.stop();
      await interaction.reply("⏹️ Music stopped!");
      break;
    case 'volume_up':
      player.setVolume(player.volume + 10);
      await interaction.reply(`🔊 Volume increased to ${player.volume}`);
      break;
    case 'volume_down':
      player.setVolume(player.volume - 10);
      await interaction.reply(`🔉 Volume decreased to ${player.volume}`);
      break;
    case 'shuffle':
      player.shuffle();
      await interaction.reply("🔀 Queue shuffled!");
      break;
    case 'loop':
      const loopModes = ["off", "track", "queue"];
      const currentLoop = player.loop;
      const nextLoop = loopModes[(loopModes.indexOf(currentLoop) + 1) % loopModes.length];
      player.setLoop(nextLoop);
      await interaction.reply(`🔁 Loop mode set to ${nextLoop}`);
      break;
    case 'skip':
      if (!player.queue.size) return interaction.reply("No more songs in the queue to skip.");
      await player.skip();
      await interaction.reply("Skipped to the next track!");
      break;
  }
});

client.login(process.env.TOKEN).catch(console.error);
