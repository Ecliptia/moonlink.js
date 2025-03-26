const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "lyrics",
    description: "Get lyrics for the current song or a specific song"
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    let query = args.join(" ");
    
    if (!query && (!player || !player.current)) {
      return message.reply(`${config.emojis.error} Please provide a song name or play a song first!`);
    }
    
    if (!query) {
      query = player.current.title;
    }
    
    const loadingEmbed = new EmbedBuilder()
      .setDescription(`${config.emojis.loading} Searching for lyrics...`)
      .setColor(config.colors.info);
    
    const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });
    
    try {
      // Check if we have NodeLink features
      if (player && player.lyrics) {
        const lyrics = await player.lyrics.getLyrics();
        
        if (!lyrics || !lyrics.lyrics) {
          loadingMsg.edit({ 
            embeds: [
              new EmbedBuilder()
                .setDescription(`${config.emojis.error} No lyrics found for \`${query}\``)
                .setColor(config.colors.error)
            ] 
          });
          return;
        }
        
        // Split lyrics into chunks of 4000 characters
        const lyricsText = lyrics.lyrics;
        const chunks = [];
        
        for (let i = 0; i < lyricsText.length; i += 4000) {
          chunks.push(lyricsText.substring(i, i + 4000));
        }
        
        const embeds = chunks.map((chunk, index) => {
          return new EmbedBuilder()
            .setTitle(`${config.emojis.info} Lyrics for ${lyrics.title}`)
            .setDescription(chunk)
            .setColor(config.colors.info)
            .setFooter({ text: `Page ${index + 1}/${chunks.length}` });
        });
        
        if (embeds.length === 1) {
          loadingMsg.edit({ embeds: [embeds[0]] });
          return;
        }
        
        // Create pagination buttons
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
        const initialMessage = await loadingMsg.edit({
          embeds: [embeds[0]],
          components: [row]
        });
        
        // Handle pagination
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
            currentIndex = Math.max(0, currentIndex - 1);
          } else if (interaction.customId === 'next') {
            currentIndex = Math.min(embeds.length - 1, currentIndex + 1);
          }
          
          await interaction.update({
            embeds: [embeds[currentIndex]],
            components: [row]
          });
        });
        
        collector.on('end', () => {
          initialMessage.edit({ components: [] }).catch(() => {});
        });
      } else {
        loadingMsg.edit({ 
          embeds: [
            new EmbedBuilder()
              .setDescription(`${config.emojis.error} Lyrics feature is not available. NodeLink is required.`)
              .setColor(config.colors.error)
          ] 
        });
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      loadingMsg.edit({ 
        embeds: [
          new EmbedBuilder()
            .setDescription(`${config.emojis.error} An error occurred while fetching lyrics: ${error.message}`)
            .setColor(config.colors.error)
        ] 
      });
    }
  },
}; 