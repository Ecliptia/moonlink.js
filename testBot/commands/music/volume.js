module.exports = {
  name: "volume",
  aliases: [],
  run: async (client, message, args) => {
    if (!message.member.voice.channel) {
      return message.reply(
        "<:hi:1176345748405768252> | First of all, you have to be in a voice channel.",
      );
    }

    if (!client.moon.players.has(message.guild.id)) return message.reply("<:hi:1176345748405768252> | On this server, the player is not playing")

    let player = client.moon.players.get(message.guild.id);

    if (!player.playing) return message.reply("<:hi:1176345748405768252> | on this server there is no player playing")

    if (!args[0]) return message.reply("<:hi:1176345748405768252> | humm..., you hear interference..., you must provide the volume height after the command, from 0 to 100")

    if (args[0] > 100 || args[0] < 0) return message.reply("<:hi:1176345748405768252> | from 0 to 100")


    player.setVolume(args[0]);
    return message.reply(`<:hi:1176345748405768252> | volume(${args[0]})`);
  },
};