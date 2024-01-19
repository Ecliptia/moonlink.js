const getColors = require("get-image-colors");
const {
  EmbedBuilder
} = require("discord.js");

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
  name: "current",
  aliases: ["c"],
  run: async (client, message, args) => {

    let player = client.moon.players.get(message.guild.id);
    if (!player) return message.reply("not playing")

    const duration = convertMsToTime(Number(player.current.duration));
    const position = convertMsToTime(Number(player.current.position));
    const colors = await getColors(
      player.current.artworkUrl.replace("webp", "png"),
    );

    const embedColor = colors[0].hex();

    const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle("<:discordlogo:968651006177079326>・Current Music.")
    .setImage(player.current.artworkUrl)
    .setFooter({
      text: `Request for: ${player.current.requester ? client.users.cache.get(player.current.requester): "Moonlink.js - AutoPlay"}`,
    }).addFields(
      {
        name: `<:Nota_Musica__Mlink:960665601574055966>╺╸*\`Title:\`*`,
        value: `[${player.current.title}](${player.current.url})`,
        inline: true,
      },
      {
        name: `<:Estrela_Mlink:960660485999587348>╺╸*\`Uri:\`*`,
        value: `${player.current.url}`,
        inline: true,
      },
      {
        name: `<:emoji_21:967836966714503168>╺╸*\`Author:\`*`,
        value: `${player.current.author}`,
        inline: true,
      },
      {
        name: `<:emoji_23:967837516558393365>╺╸*\`Duration:\`*`,
        value: `${position.days}:${position.hours}:${position.minutes}:${position.seconds}╺╸${duration.days}:${duration.hours}:${duration.minutes}:${duration.seconds}`,
        inline: true,
      }
    );

    message.reply({
      embeds: [embed],
    });
  },
};