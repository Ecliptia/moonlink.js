const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "players",
    description: "Display statistics about all active players"
  },
  async execute(client, message, args) {
    const players = Array.from(client.manager.players.cache.values());
    
    if (players.length === 0) {
      return message.reply(`${config.emojis.error} There are no active players!`);
    }
    
    // Count players by status
    const playingCount = players.filter(p => p.playing).length;
    const pausedCount = players.filter(p => p.paused).length;
    const idleCount = players.filter(p => !p.playing && !p.paused).length;
    
    // Count players by loop mode
    const loopModes = {
      off: players.filter(p => p.loop === 'off').length,
      track: players.filter(p => p.loop === 'track').length,
      queue: players.filter(p => p.loop === 'queue').length
    };
    
    // Count players by node
    const nodeMap = new Map();
    players.forEach(player => {
      const nodeId = player.node?.identifier || 'Unknown';
      nodeMap.set(nodeId, (nodeMap.get(nodeId) || 0) + 1);
    });
    
    // Calculate total tracks in all queues
    const totalTracks = players.reduce((acc, player) => acc + player.queue.size, 0);
    
    // Calculate average volume
    const avgVolume = players.reduce((acc, player) => acc + player.volume, 0) / players.length;
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.emojis.info} Player Statistics`)
      .setColor(config.colors.info)
      .addFields(
        { name: 'Total Players', value: `${players.length}`, inline: true },
        { name: 'Status', value: [
          `${config.emojis.play} Playing: ${playingCount}`,
          `${config.emojis.pause} Paused: ${pausedCount}`,
          `${config.emojis.stop} Idle: ${idleCount}`
        ].join('\n'), inline: true },
        
        { name: 'Loop Modes', value: [
          `${config.emojis.stop} Off: ${loopModes.off}`,
          `${config.emojis.repeatOne} Track: ${loopModes.track}`,
          `${config.emojis.repeat} Queue: ${loopModes.queue}`
        ].join('\n'), inline: true },
        
        { name: 'Queue Stats', value: [
          `${config.emojis.queue} Total Tracks: ${totalTracks}`,
          `${config.emojis.info} Avg. Tracks per Queue: ${(totalTracks / players.length).toFixed(2)}`
        ].join('\n'), inline: true },
        
        { name: 'Volume', value: `${config.emojis.volume} Average: ${avgVolume.toFixed(2)}%`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    // Add node distribution if there are multiple nodes
    if (nodeMap.size > 0) {
      const nodeDistribution = Array.from(nodeMap.entries())
        .map(([nodeId, count]) => `${nodeId}: ${count}`)
        .join('\n');
      
      embed.addFields({ name: 'Node Distribution', value: nodeDistribution, inline: true });
    }
    
    message.channel.send({ embeds: [embed] });
  },
}; 