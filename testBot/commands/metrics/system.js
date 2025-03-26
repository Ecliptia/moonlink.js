const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const os = require("os");

module.exports = {
  data: {
    name: "system",
    description: "Display system metrics and statistics",
    aliases: ["sys", "metrics"]
  },
  async execute(client, message, args) {
    // CPU usage
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCount = cpus.length;
    
    // Calculate CPU usage
    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    const cpuPercentage = (totalCpuTime / (os.cpus().length * 1000000)) * 100;
    
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * 100;
    
    // Format bytes to human-readable format
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    };
    
    // System uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    // Process memory usage
    const processMemory = process.memoryUsage();
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.emojis.cpu} System Metrics`)
      .setColor(config.colors.info)
      .addFields(
        { name: 'CPU', value: [
          `**Model:** ${cpuModel}`,
          `**Cores:** ${cpuCount}`,
          `**Usage:** ${cpuPercentage.toFixed(2)}%`
        ].join('\n'), inline: false },
        
        { name: 'Memory', value: [
          `**Total:** ${formatBytes(totalMem)}`,
          `**Used:** ${formatBytes(usedMem)} (${memPercentage.toFixed(2)}%)`,
          `**Free:** ${formatBytes(freeMem)}`
        ].join('\n'), inline: false },
        
        { name: 'Process Memory', value: [
          `**RSS:** ${formatBytes(processMemory.rss)}`,
          `**Heap Used:** ${formatBytes(processMemory.heapUsed)}`,
          `**Heap Total:** ${formatBytes(processMemory.heapTotal)}`
        ].join('\n'), inline: false },
        
        { name: 'System', value: [
          `**Platform:** ${os.platform()} ${os.release()} (${os.arch()})`,
          `**Hostname:** ${os.hostname()}`,
          `**Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s`
        ].join('\n'), inline: false }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
  },
}; 