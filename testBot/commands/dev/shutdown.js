const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "shutdown",
    description: "Shut down the bot",
    aliases: ["exit"]
  },
  async execute(client, message, args) {
    // Check if user is a developer
    if (!config.devs.includes(message.author.id)) {
      return message.reply(`${config.emojis.error} You do not have permission to use this command!`);
    }
    
    const embed = new EmbedBuilder()
      .setDescription(`${config.emojis.shutdown} Shutting down...`)
      .setColor(config.colors.error)
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    await message.channel.send({ embeds: [embed] });
    
    // Disconnect all players
    for (const player of client.manager.players.cache.values()) {
      player.destroy();
    }
    
    // Disconnect all nodes
    for (const node of client.manager.nodes.cache.values()) {
      node.disconnect();
    }
    
    console.log(`Bot shutdown requested by ${message.author.tag}`);
    
    // Exit process
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  },
}; 