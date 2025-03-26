const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "volume",
    description: "Change the volume of the player",
    aliases: ["vol"]
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
    
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.volume} Current volume: **${player.volume}%**`)
        .setColor(config.colors.info);
      
      return message.channel.send({ embeds: [embed] });
    }
    
    const volume = parseInt(args[0]);
    
    if (isNaN(volume) || volume < 0 || volume > 100) {
      return message.reply(`${config.emojis.error} Please provide a valid volume between 0 and 100!`);
    }
    
    player.setVolume(volume);
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.volume} Volume set to: **${volume}%**`)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
}; 