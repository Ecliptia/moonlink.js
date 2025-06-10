const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const getColors = require("get-image-colors");

module.exports = {
  data: {
    name: "play",
    description: "Play a song",
    aliases: ["p"]
  },
  async execute(client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply(`${config.emojis.error} You need to join a voice channel first!`);
    if (!args[0]) return message.reply(`${config.emojis.error} You need to provide a song or URL!`);

    const loadingEmbed = new EmbedBuilder()
      .setDescription(`${config.emojis.loading} Searching for \`${args.join(" ")}\`...`)
      .setColor(config.colors.info);
    
    const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });

    try {
      let player =
        client.manager.players.get(message.guild.id) ||
        client.manager.createPlayer({
          guildId: message.guild.id,
          voiceChannelId: channel.id,
          textChannelId: message.channel.id,
          autoPlay: true
        });

      if (!player.connected) player.connect({ setDeaf: true });

      const searchResult = await client.manager.search({
        source: args[0].includes("local:") ? "local" : "youtube",
        query: args.join(" ").replace("local:", ""),
        requester: message.author.id
      });
      
      if (!searchResult.tracks.length) {
        loadingMsg.delete().catch(() => {});
        return message.reply(`${config.emojis.error} No results found.`);
      }
      
      if (searchResult.loadType == "playlist") {  
        for (const track of searchResult.tracks) {
          player.queue.add(track);
        }
      } else {
        player.queue.add(searchResult.tracks[0]);
      }

      console.log(searchResult.tracks[0]);
      let  colors;
      try {

         colors = await getColors(
          searchResult.tracks[0].artworkUrl.replace("webp", "png"),
        )

      } catch (error) {
        colors = [{ hex: () => config.colors.player }];
      }
      const embedColor = colors[0].hex();
      
      const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("<:discordlogo:968651006177079326>・Adding Music.")
      .setImage(searchResult.tracks[0].artworkUrl)
      .setFooter({
        text: `Request for: ${message.author.username}`,
      });

    if (searchResult.loadType === "playlist") {
      embed.setTitle(`<:discordlogo:968651006177079326>・Adding Playlist.`);
      embed.addFields(
        {
          name: `<:Nota_Musica__Mlink:960665601574055966>╺╸*\`Playlist Name:\`*`,
          value: searchResult.playlistInfo.name,
          inline: true,
        },
        {
          name: `<:emoji_23:967837516558393365>╺╸*\`Duration:\`*`,
          value: `${formatDuration(searchResult.playlistInfo.duration)}`,
          inline: true,
        },
      );
    } else {
      const duration = formatDuration(searchResult.tracks[0].duration);
      embed.addFields(
        {
          name: `<:Nota_Musica__Mlink:960665601574055966>╺╸*\`Title:\`*`,
          value: `[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})`,
          inline: true,
        },
        {
          name: `<:Estrela_Mlink:960660485999587348>╺╸*\`Url:\`*`,
          value: `${searchResult.tracks[0].url}`,
          inline: true,
        },
        {
          name: `<:emoji_21:967836966714503168>╺╸*\`Author:\`*`,
          value: `${searchResult.tracks[0].author}`,
          inline: true,
        },
        {
          name: `<:emoji_23:967837516558393365>╺╸*\`Duration:\`*`,
          value: `${duration}`,
          inline: true,
        },
      );
    }

      if (!player.playing) {
        player.play();
      }
      
      loadingMsg.edit({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      console.error(error);
      loadingMsg.delete().catch(() => {});
      message.reply(`${config.emojis.error} An error occurred: ${error.message}`);
    }
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
