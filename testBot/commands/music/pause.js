const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "pause",
    description: "Pause or resume the current song",
    aliases: ["resume"]
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player) {
      return message.reply(`${config.emojis.error} There is nothing playing in this server!`);
    }
    
    if (!player.current) {
      return message.reply(`${config.emojis.error} There is no track currently playing!`);
    }
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(`${config.emojis.error} You need to be in a voice channel to use this command!`);
    }
    
    if (voiceChannel.id !== player.voiceChannelId) {
      return message.reply(`${config.emojis.error} You need to be in the same voice channel as the bot to use this command!`);
    }
    
    if (player.paused) {
      player.resume();
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.play} Resumed [${player.current.title}](${player.current.url})`)
        .setColor(config.colors.success);
      
      message.channel.send({ embeds: [embed] });
    } else {
      player.pause();
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.pause} Paused [${player.current.title}](${player.current.url})`)
        .setColor(config.colors.success);
      
      message.channel.send({ embeds: [embed] });
    }
  },
}; 