const getColors = require("get-image-colors");
const { EmbedBuilder } = require("discord.js");

function convertMsToTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}

module.exports = {
  name: "play",
  aliases: ["p"],
  run: async (client, message, args) => {
    if (!message.member.voice.channel) {
      return message.reply(
        "<:hi:1176345748405768252> | First of all, you have to be in a voice channel.",
      );
    }

    if (!args[0]) {
      return message.reply(
        "<:hi:1176345748405768252> | For us to continue, you need to provide me with the name of a song or a link",
      );
    }

    const player = client.moon.players.create({
      guildId: message.guild.id,
      textChannel: message.channel.id,
      voiceChannel: message.member.voice.channel.id,
    });

    if (!player.connected) {
      player.connect({
        setDeaf: true,
        setMute: false,
      });
    }

    const query = args.join(" ");
    const searchResult = await client.moon.search(query);

    if (searchResult.loadType === "loadfailed") {
      return message.reply(":x: Failed to load the requested song.");
    } else if (searchResult.loadType === "empty") {
      return message.reply(":x: No matching songs found!");
    }

    const colors = await getColors(
      searchResult.tracks[0].artworkUrl.replace("webp", "png"),
    );
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
          value: `${
            convertMsToTime(searchResult.playlistInfo.duration).days
          } Days, ${
            convertMsToTime(searchResult.playlistInfo.duration).hours
          } Hours, ${
            convertMsToTime(searchResult.playlistInfo.duration).minutes
          } Minutes, ${
            convertMsToTime(searchResult.playlistInfo.duration).seconds
          } Seconds`,
          inline: true,
        },
      );

      message.reply({
        embeds: [embed],
      });

      for (const track of searchResult.tracks) {
        player.queue.add(track);
      }
    } else {
      const duration = convertMsToTime(Number(searchResult.tracks[0].duration));
      embed.addFields(
        {
          name: `<:Nota_Musica__Mlink:960665601574055966>╺╸*\`Title:\`*`,
          value: `[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})`,
          inline: true,
        },
        {
          name: `<:Estrela_Mlink:960660485999587348>╺╸*\`Uri:\`*`,
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
          value: `${duration.days} Days, ${duration.hours} Hours, ${duration.minutes} Minutes, ${duration.seconds} Seconds`,
          inline: true,
        },
      );

      player.queue.add(searchResult.tracks[0]);
      message.reply({
        embeds: [embed],
      });
    }

    if (!player.playing) {
      player.play();
    }
  },
};