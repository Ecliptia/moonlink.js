const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "lyrics",
    description: "Get lyrics for the current song or a specific song",
    options: [
      {
        name: "query",
        description: "The song to search lyrics for",
        type: 3, // STRING
        required: false,
      },
      {
        name: "provider",
        description: "The lyrics provider (lavalyrics or lyricskt)",
        type: 3, // STRING
        required: false,
        choices: [
          { name: "lavalyrics", value: "lavalyrics" },
          { name: "lyricskt", value: "lyricskt" },
        ],
      },
    ],
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);

    let query = null;
    let provider = null;

    // Parse arguments
    const providerIndex = args.indexOf("--provider");
    if (providerIndex !== -1 && args.length > providerIndex + 1) {
      provider = args[providerIndex + 1];
      args.splice(providerIndex, 2);
    }
    query = args.join(" ");
    if (query === "") query = null;

    // Map provider names to match plugin names in Manager
    if (provider === "lyricskt") {
      provider = "lyrics";
    } else if (provider === "lavalyrics") {
      provider = "lavalyrics";
    } else {
      provider = "java-lyrics-plugin"; // Default provider if not specified or invalid
    }

    let lyrics = null;
    let title = "";

    const loadingEmbed = new EmbedBuilder()
      .setDescription(`${config.emojis.loading} Searching for lyrics...`)
      .setColor(config.colors.info);

    const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });

    try {
      if (query) {
        // Search for lyrics by query
        const searchResults = await client.manager.searchLyrics({
          query: query,
          provider: provider,
        });

        if (!searchResults || searchResults.length === 0 || searchResults.error) {
          loadingMsg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(`${config.emojis.error} No lyrics found for \`${query}\``)
                .setColor(config.colors.error),
            ],
          });
          return;
        }

        let foundLyrics = false;
        for (const result of searchResults) {
          if (result && result.videoId) {
            lyrics = await client.manager.getLyrics({
              videoId: result.videoId,
              provider: provider,
            });
            if (lyrics && (lyrics.text || (lyrics.lines && lyrics.lines.length > 0))) {
              title = `Lyrics for ${result.title || query}`;
              foundLyrics = true;
              break;
            }
          }
        }

        if (!foundLyrics) {
          loadingMsg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(`${config.emojis.error} No lyrics found for \`${query}\``)
                .setColor(config.colors.error),
            ],
          });
          return;
        }
      } else {
        // Get lyrics for currently playing song
        if (!player || !player.current) {
          loadingMsg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(`${config.emojis.error} No song is currently playing.`)
                .setColor(config.colors.error),
            ],
          });
          return;
        }
        lyrics = await client.manager.getLyrics({
          player: player,
          provider: provider,
        });
        title = `Lyrics for ${player.current.title}`;
      }

      // Check if lyrics were found
      if (!lyrics || (!lyrics.text && (!lyrics.lines || lyrics.lines.length === 0))) {
        loadingMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${config.emojis.error} No lyrics found for \`${title.replace("Lyrics for ", "")}\``)
              .setColor(config.colors.error),
          ],
        });
        return;
      }

      let lyricsContent = "";
      if (lyrics.lines && lyrics.lines.length > 0) {
        lyricsContent = lyrics.lines.map((line) => line.line).join("\n");
      } else if (lyrics.text) {
        lyricsContent = lyrics.text;
      }

      // Split lyrics into chunks for Discord embed limits
      const chunks = [];
      for (let i = 0; i < lyricsContent.length; i += 4000) {
        chunks.push(lyricsContent.substring(i, i + 4000));
      }

      const embeds = chunks.map((chunk, index) => {
        return new EmbedBuilder()
          .setTitle(`${config.emojis.info} ${title}`)
          .setDescription(chunk)
          .setColor(config.colors.info)
          .setFooter({
            text: `Page ${index + 1}/${chunks.length} | Source: ${lyrics.source || "Unknown"} | Provider: ${lyrics.provider || "Unknown"}`,
          });
      });

      if (embeds.length === 1) {
        loadingMsg.edit({ embeds: [embeds[0]] });
        return;
      }

      // Create pagination buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("⬅️"),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("➡️")
      );

      let currentIndex = 0;
      const initialMessage = await loadingMsg.edit({
        embeds: [embeds[0]],
        components: [row],
      });

      const collector = initialMessage.createMessageComponentCollector({
        time: 300000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: `${config.emojis.error} This interaction is not for you!`,
            ephemeral: true,
          });
        }

        if (interaction.customId === "prev") {
          currentIndex = Math.max(0, currentIndex - 1);
        } else if (interaction.customId === "next") {
          currentIndex = Math.min(embeds.length - 1, currentIndex + 1);
        }

        await interaction.update({
          embeds: [embeds[currentIndex]],
          components: [row],
        });
      });

      collector.on("end", () => {
        initialMessage.edit({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      loadingMsg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${config.emojis.error} An error occurred while fetching lyrics: ${error.message}`)
            .setColor(config.colors.error),
        ],
      });
    }
  },
};