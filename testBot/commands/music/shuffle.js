module.exports = {
  name: "shuffle",
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
    
    if(!player.queue.size) return message.reply("<:hi:1176345748405768252> | ")
    
    player.shuffle(!player.shuffled);
    return message.reply(`<:hi:1176345748405768252> | shuffled(${player.shuffled})`);
  },
};