module.exports = {
  name: "loop",
  aliases: [],
  run: async (client, message, args) => {
    if (!message.member.voice.channel) {
      return message.reply(
        "<:hi:1176345748405768252> | First of all, you have to be in a voice channel.",
      );
    }

    if (!client.moon.players.has(message.guild.id)) return message.reply("<:hi:1176345748405768252> | On this server, the player is not playing")

    let player = client.moon.players.get(message.guild.id);

    if (!player.playing) return message.reply("<:hi:1176345748405768252> | ")
    if (!args[0]) return message.reply("<:hi:1176345748405768252> | off, track or queue")

    if (!args[0].includes(["off", "track", "queue"])) return message.reply("<:hi:1176345748405768252> | track or queue")


    let mode = 0;
    args[0] == "track" ? mode = 1: args[0] == "queue" ? mode = 2: mode = 0
    player.setLoop(mode);
    return message.reply(`<:hi:1176345748405768252> | loop(${args[0]})`);
  },
};