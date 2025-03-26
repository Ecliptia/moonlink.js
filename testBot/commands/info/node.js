const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "node",
    description: "Display information about the connected Lavalink nodes"
  },
  async execute(client, message, args) {
    const nodes = Array.from(client.manager.nodes.cache.values());
    
    if (nodes.length === 0) {
      return message.reply(`${config.emojis.error} No nodes are connected!`);
    }
    
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    };
    
    const formatDuration = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };
    
    const embeds = nodes.map(node => {
      const embed = new EmbedBuilder()
        .setTitle(`${config.emojis.info} Node Information: ${node.identifier}`)
        .setColor(node.connected ? config.colors.success : config.colors.error)
        .addFields(
          { name: 'Status', value: node.connected ? `${config.emojis.online} Online` : `${config.emojis.offline} Offline`, inline: true },
          { name: 'Address', value: `${node.host}:${node.port}`, inline: true },
          { name: 'Region', value: node.regions?.join(', ') || 'None', inline: true }
        );
      
      if (node.stats) {
        embed.addFields(
          { name: 'Players', value: `${node.stats.players} (${node.stats.playingPlayers} playing)`, inline: true },
          { name: 'Uptime', value: formatDuration(node.stats.uptime), inline: true },
          { name: 'Memory', value: `${formatBytes(node.stats.memory.used)} / ${formatBytes(node.stats.memory.allocated)}`, inline: true },
          { name: 'CPU', value: `Lavalink: ${node.stats.cpu.lavalinkLoad.toFixed(2)}%\nSystem: ${node.stats.cpu.systemLoad.toFixed(2)}%`, inline: true },
          { name: 'Frame Stats', value: `Sent: ${node.stats.frameStats?.sent || 0}\nNulled: ${node.stats.frameStats?.nulled || 0}\nDeficit: ${node.stats.frameStats?.deficit || 0}`, inline: true }
        );
      }
      
      if (node.info) {
        embed.addFields(
          { name: 'Version', value: node.version || 'Unknown', inline: true },
          { name: 'NodeLink', value: node.info.isNodeLink ? 'Yes' : 'No', inline: true }
        );
      }
      
      return embed;
    });
    
    if (embeds.length === 1) {
      message.channel.send({ embeds: [embeds[0]] });
    } else {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅️'),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️')
        );
      
      let currentIndex = 0;
      const initialMessage = await message.channel.send({
        embeds: [embeds[0]],
        components: [row]
      });
      
      const collector = initialMessage.createMessageComponentCollector({
        time: 300000 // 5 minutes
      });
      
      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({ 
            content: `${config.emojis.error} This interaction is not for you!`, 
            ephemeral: true 
          });
        }
        
        if (interaction.customId === 'prev') {
          currentIndex = (currentIndex - 1 + embeds.length) % embeds.length;
        } else if (interaction.customId === 'next') {
          currentIndex = (currentIndex + 1) % embeds.length;
        }
        
        await interaction.update({
          embeds: [embeds[currentIndex]],
          components: [row]
        });
      });
      
      collector.on('end', () => {
        initialMessage.edit({ components: [] }).catch(() => {});
      });
    }
  },
}; 