const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "queue",
    description: "Show the current queue",
    aliases: ["q"]
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player) {
      return message.reply(`${config.emojis.error} There is nothing playing in this server!`);
    }
    
    if (!player.current && player.queue.size === 0) {
      return message.reply(`${config.emojis.error} There are no tracks in the queue!`);
    }
    
    const formatDuration = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor(ms / (1000 * 60 * 60));
      
      return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.emojis.queue} Queue for ${message.guild.name}`)
      .setColor(config.colors.queue);
    
    // Current track
    if (player.current) {
      embed.setDescription(`**${config.emojis.play} Now Playing:**\n[${player.current.title}](${player.current.url}) | \`${formatDuration(player.current.duration)}\`\n\n**Up Next:**`);
    }
    
    // Queue tracks
    const queuedTracks = player.queue.tracks;
    const totalPages = Math.ceil(queuedTracks.length / 10) || 1;
    const page = args[0] ? parseInt(args[0]) : 1;
    
    if (page > totalPages) return message.reply(`${config.emojis.error} There are only ${totalPages} pages!`);
    
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const currentTracks = queuedTracks.slice(startIndex, endIndex);
    
    if (currentTracks.length > 0) {
      const trackList = currentTracks.map((track, index) => 
        `**${startIndex + index + 1}.** [${track.title}](${track.url}) | \`${formatDuration(track.duration)}\``
      ).join('\n');
      
      embed.addFields({ name: '\u200B', value: trackList });
    } else {
      embed.addFields({ name: '\u200B', value: 'No tracks in queue' });
    }
    
    // Queue stats
    const totalDuration = player.queue.duration + (player.current ? player.current.duration : 0);
    
    embed.addFields(
      { name: 'Total Tracks', value: `${queuedTracks.length + (player.current ? 1 : 0)}`, inline: true },
      { name: 'Total Duration', value: formatDuration(totalDuration), inline: true },
      { name: 'Requested By', value: `<@${message.author.id}>`, inline: true }
    );
    
    embed.setFooter({ text: `Page ${page}/${totalPages} • Loop: ${player.loop}` });
    
    message.channel.send({ embeds: [embed] });
  },
}; 