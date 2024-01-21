module.exports = {
  name: "seek",
  aliases: [],
  run: async (client, message, args) => {
    if (!message.member.voice.channel) {
      return message.reply(
        "<:hi:1176345748405768252> | First of all, you have to be in a voice channel.",
      );
    }

    if (!client.moon.players.has(message.guild.id)) return message.reply("<:hi:1176345748405768252> | On this server, the player is not playing")

    if (!args[0]) return message.reply("<:hi:1176345748405768252> | position")

    let player = client.moon.players.get(message.guild.id);

    if (!player.playing) return message.reply("<:hi:1176345748405768252> | ")

    if (!args[0] >= player.current.duration) return message.reply("<:hi:1176345748405768252> | track or queue")

    player.seek(args[0]);
    return message.reply(`<:hi:1176345748405768252> | seek(${args[0]})`);
  },
};