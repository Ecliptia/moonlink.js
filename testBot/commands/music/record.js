const fs = require("node:fs");

module.exports = {
  name: "record",
  aliases: [],
  run: async (client, message, args) => {
    if (!message.member.voice.channel) {
      return message.reply(
        "<:hi:1176345748405768252> | First of all, you have to be in a voice channel.",
      );
    }

    if (!client.moon.players.has(message.guild.id)) return message.reply("<:hi:1176345748405768252> | On this server, the player is not playing")

    let player = client.moon.players.get(message.guild.id);

    const listener = player.listenVoice()
    const writeStream = fs.createWriteStream("test.ogg")

    console.log(listener)
    listener.on("start", (data) => {
      /* Emitted when something starts speaking */
    })

    listener.on("end", (data) => {
      /* Emitted when something stops speaking */
      writeStream.write(data.data);
    })
  },
};