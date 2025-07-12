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
    let encodedTrack = null;

    if (!query && (!player || !player.current)) {
      return message.reply(`${config.emojis.error} Please provide a song name or play a song first!`);
    }
    
    if (!query) {
      encodedTrack = player.current.encoded;
    }
    
    const loadingEmbed = new EmbedBuilder()
      .setDescription(`${config.emojis.loading} Searching for lyrics...`)
      .setColor(config.colors.info);
    
    const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });
    
    try {
      const lyrics = await client.manager.getLyrics({
        player: player,
        encodedTrack: encodedTrack,
        // skipTrackSource: true // Uncomment if you want to skip track source
      });
        
      if (!lyrics || (!lyrics.text && (!lyrics.lines || lyrics.lines.length === 0))) {
        loadingMsg.edit({ 
          embeds: [
            new EmbedBuilder()
              .setDescription(`${config.emojis.error} No lyrics found for \`${query || player?.current?.title}\``)
              .setColor(config.colors.error)
          ] 
        });
        return;
      }
      
      let lyricsContent = "";
      let title = `Lyrics for ${query || player?.current?.title}`;

      if (lyrics.lines && lyrics.lines.length > 0) {
        lyricsContent = lyrics.lines.map(line => line.line).join("\n");
      } else if (lyrics.text) {
        lyricsContent = lyrics.text;
      }

      // Split lyrics into chunks of 4000 characters
      const chunks = [];
      for (let i = 0; i < lyricsContent.length; i += 4000) {
        chunks.push(lyricsContent.substring(i, i + 4000));
      }
      
      const embeds = chunks.map((chunk, index) => {
        return new EmbedBuilder()
          .setTitle(`${config.emojis.info} ${title}`)
          .setDescription(chunk)
          .setColor(config.colors.info)
          .setFooter({ text: `Page ${index + 1}/${chunks.length} | Source: ${lyrics.sourceName || 'Unknown'} | Provider: ${lyrics.provider || 'Unknown'}` });
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