const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "filter",
    description: "Apply audio filters to the player"
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
    
    const availableFilters = [
      'reset', 'bass', 'nightcore', 'vaporwave', 'pop', 'soft', 
      'treblebass', '8d', 'karaoke', 'vibrato', 'tremolo', 'distortion'
    ];
    
    if (!args[0] || !availableFilters.includes(args[0].toLowerCase())) {
      const embed = new EmbedBuilder()
        .setTitle(`${config.emojis.filter} Available Filters`)
        .setDescription(availableFilters.map(filter => `\`${filter}\``).join(', '))
        .setColor(config.colors.info);
      
      return message.channel.send({ embeds: [embed] });
    }
    
    const filter = args[0].toLowerCase();
    
    if (filter === 'reset') {
      player.filters.clearFilters();
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.success} All filters have been reset`)
        .setColor(config.colors.success);
      
      return message.channel.send({ embeds: [embed] });
    }
    
    // Apply the selected filter
    switch (filter) {
      case 'bass':
        player.filters.setEqualizer([
          { band: 0, gain: 0.6 },
          { band: 1, gain: 0.7 },
          { band: 2, gain: 0.8 },
          { band: 3, gain: 0.55 },
          { band: 4, gain: 0.25 },
          { band: 5, gain: 0 }
        ]);
        break;
      case 'nightcore':
        player.filters.setTimescale({ rate: 1.3, pitch: 1.3, speed: 1 });
        break;
      case 'vaporwave':
        player.filters.setTimescale({ rate: 0.8, pitch: 0.8, speed: 1 });
        break;
      case 'pop':
        player.filters.setEqualizer([
          { band: 0, gain: 0.65 },
          { band: 1, gain: 0.45 },
          { band: 2, gain: -0.45 },
          { band: 3, gain: -0.65 },
          { band: 4, gain: -0.35 },
          { band: 5, gain: 0.45 },
          { band: 6, gain: 0.55 },
          { band: 7, gain: 0.6 },
          { band: 8, gain: 0.6 },
          { band: 9, gain: 0.6 }
        ]);
        break;
      case 'soft':
        player.filters.setEqualizer([
          { band: 0, gain: 0 },
          { band: 1, gain: 0 },
          { band: 2, gain: 0 },
          { band: 3, gain: 0 },
          { band: 4, gain: 0 },
          { band: 5, gain: 0 },
          { band: 6, gain: 0 },
          { band: 7, gain: 0 },
          { band: 8, gain: -0.25 },
          { band: 9, gain: -0.25 },
          { band: 10, gain: -0.25 },
          { band: 11, gain: -0.25 },
          { band: 12, gain: -0.25 },
          { band: 13, gain: -0.25 }
        ]);
        break;
      case 'treblebass':
        player.filters.setEqualizer([
          { band: 0, gain: 0.6 },
          { band: 1, gain: 0.67 },
          { band: 2, gain: 0.67 },
          { band: 3, gain: 0 },
          { band: 4, gain: -0.5 },
          { band: 5, gain: 0.15 },
          { band: 6, gain: -0.45 },
          { band: 7, gain: 0.23 },
          { band: 8, gain: 0.35 },
          { band: 9, gain: 0.45 },
          { band: 10, gain: 0.55 },
          { band: 11, gain: 0.6 },
          { band: 12, gain: 0.55 },
          { band: 13, gain: 0 }
        ]);
        break;
      case '8d':
        player.filters.setRotation({ rotationHz: 0.2 });
        break;
      case 'karaoke':
        player.filters.setKaraoke({
          level: 1.0,
          monoLevel: 1.0,
          filterBand: 220.0,
          filterWidth: 100.0
        });
        break;
      case 'vibrato':
        player.filters.setVibrato({ frequency: 4.0, depth: 0.75 });
        break;
      case 'tremolo':
        player.filters.setTremolo({ frequency: 4.0, depth: 0.75 });
        break;
      case 'distortion':
        player.filters.setDistortion({
          sinOffset: 0,
          sinScale: 1,
          cosOffset: 0,
          cosScale: 1,
          tanOffset: 0,
          tanScale: 1,
          offset: 0,
          scale: 1
        });
        break;
    }
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.filter} Applied filter: **${filter}**`)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
}; 