const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "search",
    description: "Search for a song"
  },
  async execute(client, message, args) {
    if (!args.length) {
      return message.reply(`${config.emojis.error} You need to provide a search term!`);
    }

    const searchTerm = args.join(" ");
    
    const loadingEmbed = new EmbedBuilder()
      .setDescription(`${config.emojis.loading} Searching for \`${searchTerm}\`...`)
      .setColor(config.colors.info);
    
    const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });
    
    try {
      const results = await client.manager.search({ 
        query: searchTerm, 
        requester: message.author.id 
      });
      
      if (!results.tracks.length) {
        loadingMsg.edit({ 
          embeds: [
            new EmbedBuilder()
              .setDescription(`${config.emojis.error} No results found for \`${searchTerm}\``)
              .setColor(config.colors.error)
          ]
        });
        return;
      }

      const tracks = results.tracks.slice(0, 10);
      
      const embed = new EmbedBuilder()
        .setTitle(`${config.emojis.search} Search Results for "${searchTerm}"`)
        .setDescription(
          tracks.map((track, index) => 
            `**${index + 1}.** [${track.title}](${track.url}) - \`${formatDuration(track.duration)}\``
          ).join("\n")
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setColor(config.colors.info);

      loadingMsg.edit({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      loadingMsg.edit({ 
        embeds: [
          new EmbedBuilder()
            .setDescription(`${config.emojis.error} An error occurred: ${error.message}`)
            .setColor(config.colors.error)
        ]
      });
    }
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
