const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "stop",
    description: "Stop the player and clear the queue",
    aliases: ["leave", "disconnect"]
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player) {
      return message.reply(`${config.emojis.error} There is nothing playing in this server!`);
    }
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(`${config.emojis.error} You need to be in a voice channel to use this command!`);
    }
    
    if (voiceChannel.id !== player.voiceChannelId) {
      return message.reply(`${config.emojis.error} You need to be in the same voice channel as the bot to use this command!`);
    }
    
    player.queue.clear();
    player.stop();
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.stop} Stopped the player and cleared the queue`)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
}; 