const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "skip",
    description: "Skip the current song",
    aliases: ["s", "next"]
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
    
    const currentTrack = player.current;
    
    if (args[0] && !isNaN(args[0])) {
      const position = parseInt(args[0]);
      if (position <= 0) {
        return message.reply(`${config.emojis.error} Please provide a valid position!`);
      }
      
      player.skip(position);
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.skip} Skipped to position \`${position}\``)
        .setColor(config.colors.success);
      
      return message.channel.send({ embeds: [embed] });
    }
    
    player.skip();
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.skip} Skipped [${currentTrack.title}](${currentTrack.url})`)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
}; 