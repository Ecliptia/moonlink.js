const Discord = require("discord.js");
const { Manager } = require("../dist/index.js");
require("dotenv").config();

const client = new Discord.Client({ intents: 131071 });
// testing
client.manager = new Manager({
  nodes: [
    {
      host: "localhost",
      port: 3000,
      password: "youshallnotpass",
      region: ["us", "eu", "singapore", "sydney", "brazil", "hongkong", "russia"],
      identifier: "MAIN",
      secure: false,
      pathVersion: "v1"
    }
  ],
  sendPayload: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));
  }
});

const voiceChannelId = "1365699910611107962";
let player;
let prevNonBotCount = 0;
let track;
client.once("ready", async() => {
  client.manager.init(client.user.id);
  console.log(`${client.user.tag} is ready.`);
  setTimeout(async() => {
    track = searchResult = await client.manager.search({
    query: "sprec:seed_tracks=3vkCueOmm7xQDoJ17W1Pm3",
    requester: client.user.id
  }) 
  console.log("Track found:", track.tracks[0])
}, 2000)
  
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const guild = newState.guild;
  const channel = guild.channels.cache.get(voiceChannelId);
  if (!channel || channel.type !== Discord.ChannelType.GuildVoice) return;

  const nonBotCount = channel.members.filter(m => !m.user.bot).size;

  if (prevNonBotCount === 0 && nonBotCount > 0) {
    try {
      player = client.manager.players.get(guild.id) ||
        client.manager.createPlayer({
          guildId: guild.id,
          voiceChannelId: voiceChannelId,
          textChannelId: null,
          autoPlay: false,
          autoLeave: false,
          loop: "track"
        });

      if (!player.connected) await player.connect({ setDeaf: true });

      if (track.tracks.length) {
        player.queue.clear();
        player.queue.add(track.tracks[0]);
        player.play();
        player.setLoop("track");
        console.log("Playback started and looping.");
      } else {
        console.error("Track not found: Zorro - Heaven Was Mine after All");
      }
    } catch (error) {
      console.error("Error while starting playback:", error);
    }
  }

  if (prevNonBotCount > 0 && nonBotCount === 0) {
    if (player) {
      player.destroy();
      console.log("No listeners left, player destroyed.");
    }
  }

  prevNonBotCount = nonBotCount;
});

client.on("raw", (d) => client.manager.packetUpdate(d));
client.manager.on("debug", (info) => console.log(info));
client.login(process.env.TOKEN).catch(console.error);
