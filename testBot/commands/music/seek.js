const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "seek",
    description: "Seek to a specific position in the current song"
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player || !player.current) {
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
      return message.reply(`${config.emojis.error} Please provide a position to seek to! (e.g. 1:30)`);
    }
    
    const time = args[0];
    let seekPosition;
    
    if (time.includes(':')) {
      const parts = time.split(':');
      if (parts.length === 2) {
        // Minutes and seconds
        seekPosition = (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
      } else if (parts.length === 3) {
        // Hours, minutes, and seconds
        seekPosition = (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])) * 1000;
      } else {
        return message.reply(`${config.emojis.error} Invalid time format! Use mm:ss or hh:mm:ss`);
      }
    } else {
      // Assume seconds
      seekPosition = parseInt(time) * 1000;
    }
    
    if (isNaN(seekPosition)) {
      return message.reply(`${config.emojis.error} Invalid time format! Use mm:ss or hh:mm:ss`);
    }
    
    if (seekPosition < 0 || seekPosition > player.current.duration) {
      return message.reply(`${config.emojis.error} Seek position must be between 0 and ${formatDuration(player.current.duration)}!`);
    }
    
    player.seek(seekPosition);
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.success} Seeked to \`${formatDuration(seekPosition)}\``)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
} 