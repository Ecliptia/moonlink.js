const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const parts = [];
  if (hours > 0) parts.push(hours.toString());
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(seconds.toString().padStart(2, '0'));
  return parts.join(':');
}

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
      const searchPromises = [
        client.manager.search({ query: searchTerm, requester: message.author.id }),
      ];

      const bestNode = client.manager.nodes.best;
      if (bestNode && bestNode.capabilities?.has("lavasearch")) {
        searchPromises.push(client.manager.lavaSearch({
          query: searchTerm,
          requester: message.author.id,
          types: ["track", "album", "artist", "playlist", "text"]
        }));
      }

      const results = await Promise.all(searchPromises);

      const standardResults = results[0];
      const lavaSearchResults = results.length > 1 ? results[1] : {};

      const allTracks = [
        ...(standardResults?.tracks || []),
        ...(lavaSearchResults?.tracks || [])
      ];

      const trackMap = new Map();
      allTracks.forEach(track => {
        if (!trackMap.has(track.uri)) {
          trackMap.set(track.uri, track);
        }
      });
      const uniqueTracks = Array.from(trackMap.values());

      const { albums = [], artists = [], playlists = [], texts = [] } = lavaSearchResults;

      if (uniqueTracks.length === 0 && albums.length === 0 && artists.length === 0 && playlists.length === 0 && texts.length === 0) {
        return loadingMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${config.emojis.error} No results found for \`${searchTerm}\``)
              .setColor(config.colors.error)
          ]
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${config.emojis.search} Search Results for "${searchTerm}"`)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setColor(config.colors.info);

      const MAX_ITEMS_PER_CATEGORY = 5;

      if (albums.length > 0) {
        const albumList = albums.slice(0, MAX_ITEMS_PER_CATEGORY).map((album, index) => {
          const name = album.info.name;
          const url = album.info.uri;
          return `**${index + 1}.** ${url ? `[${name}](${url})` : name}`;
        }).join("\n");
        embed.addFields({ name: 'Albums', value: albumList, inline: false });
      }

      if (artists.length > 0) {
        const artistList = artists.slice(0, MAX_ITEMS_PER_CATEGORY).map((artist, index) => {
          const name = artist.info.name;
          const url = artist.info.uri;
          return `**${index + 1}.** ${url ? `[${name}](${url})` : name}`;
        }).join("\n");
        embed.addFields({ name: 'Artists', value: artistList, inline: false });
      }

      if (playlists.length > 0) {
        const playlistList = playlists.slice(0, MAX_ITEMS_PER_CATEGORY).map((playlist, index) => {
          const name = playlist.info.name;
          const url = playlist.info.uri;
          return `**${index + 1}.** ${url ? `[${name}](${url})` : name}`;
        }).join("\n");
        embed.addFields({ name: 'Playlists', value: playlistList, inline: false });
      }

      if (texts.length > 0) {
        const textList = texts.slice(0, MAX_ITEMS_PER_CATEGORY).map((text, index) =>
          `**${index + 1}.** ${text.text}`
        ).join("\n");
        embed.addFields({ name: 'Texts', value: textList, inline: false });
      }

      if (uniqueTracks.length > 0) {
        const trackList = uniqueTracks.slice(0, 10).map((track, index) =>
          `**${index + 1}.** [${track.title}](${track.url}) - ${track.author} (\`${formatDuration(track.duration)}\`)`
        ).join("\n");
        embed.addFields({ name: 'Tracks', value: trackList, inline: false });
        if (uniqueTracks.length > 10) {
          embed.addFields({ name: ' ', value: `...and ${uniqueTracks.length - 10} more tracks.`, inline: false });
        }
      }

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