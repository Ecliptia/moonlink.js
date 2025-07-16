const { EmbedBuilder, version: djsVersion } = require("discord.js");
const { version: moonlinkVersion } = require("moonlink.js");
const config = require("../../config");
const os = require("os");
const process = require("process");

module.exports = {
  data: {
    name: "botinfo",
    description: "Display information about the bot",
    aliases: ["info", "stats"]
  },
  async execute(client, message, args) {
    // Calculate uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);
    
    // Calculate memory usage
    const memoryUsage = process.memoryUsage();
    const formatMemory = (bytes) => {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };
    
    // Get system info
    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;
    const platform = `${os.type()} ${os.release()} (${os.arch()})`;
    
    // Get bot stats
    const serverCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const channelCount = client.channels.cache.size;
    const playerCount = client.manager.players.all.size;
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.emojis.info} Bot Information`)
      .setColor(config.colors.primary)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: 'Bot Stats', value: [
          `**Servers:** ${serverCount}`,
          `**Users:** ${userCount}`,
          `**Channels:** ${channelCount}`,
          `**Active Players:** ${playerCount}`
        ].join('\n'), inline: true },
        
        { name: 'Uptime', value: [
          `**Days:** ${days}`,
          `**Hours:** ${hours}`,
          `**Minutes:** ${minutes}`,
          `**Seconds:** ${seconds}`
        ].join('\n'), inline: true },
        
        { name: 'Memory Usage', value: [
          `**RSS:** ${formatMemory(memoryUsage.rss)}`,
          `**Heap Used:** ${formatMemory(memoryUsage.heapUsed)}`,
          `**Heap Total:** ${formatMemory(memoryUsage.heapTotal)}`
        ].join('\n'), inline: true },
        
        { name: 'System Info', value: [
          `**Platform:** ${platform}`,
          `**CPU:** ${cpuModel}`,
          `**Cores:** ${cpuCores}`,
          `**Node.js:** ${process.version}`
        ].join('\n'), inline: true },
        
        { name: 'Versions', value: [
          `**Discord.js:** v${djsVersion}`,
          `**Moonlink.js:** v${moonlinkVersion}`
        ].join('\n'), inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
  },
}; 