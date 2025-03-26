const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "shuffle",
    description: "Shuffle the queue",
    aliases: ["mix"]
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player) {
      return message.reply(`${config.emojis.error} There is nothing playing in this server!`);
    }
    
    if (player.queue.size < 2) {
      return message.reply(`${config.emojis.error} Need at least 2 songs in the queue to shuffle!`);
    }
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(`${config.emojis.error} You need to be in a voice channel to use this command!`);
    }
    
    if (voiceChannel.id !== player.voiceChannelId) {
      return message.reply(`${config.emojis.error} You need to be in the same voice channel as the bot to use this command!`);
    }
    
    player.queue.shuffle();
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.shuffle} Queue has been shuffled!`)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
}; 