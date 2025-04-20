import { EmbedBuilder } from "npm:discord.js";
import config from "../../config.js";

export default {
  name: "play",
  async execute(client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply(`${config.emojis.error} You need to join a voice channel first!`);
    
    if (!args.length) return message.reply(`${config.emojis.error} You need to provide a song or URL!`);

    const loadingEmbed = new EmbedBuilder()
      .setDescription(`${config.emojis.loading} Searching for \`${args.join(" ")}\`...`)
      .setColor(config.colors.info);
    
    const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });

    try {
      let player = client.manager.players.get(message.guild.id) || 
        client.manager.createPlayer({
          guildId: message.guild.id,
          voiceChannelId: channel.id,
          textChannelId: message.channel.id,
          autoPlay: true,
        });

      if (!player.connected) player.connect({ setDeaf: true });

      const searchResult = await client.manager.search({ 
        query: args.join(" "), 
        requester: message.author.id 
      });
      
      if (!searchResult.tracks.length) {
        loadingMsg.delete().catch(() => {});
        return message.reply(`${config.emojis.error} No results found.`);
      }
      
      if (searchResult.loadType === "playlist") {  
        for (const track of searchResult.tracks) {
          player.queue.add(track);
        }
      } else {
        player.queue.add(searchResult.tracks[0]);
      }

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`${config.emojis.success} Track added to queue`)
        .setFooter({ text: `Requested by: ${message.author.username}` });

      if (searchResult.loadType === "playlist") {
        embed.setDescription(`**Playlist:** ${searchResult.playlistInfo.name}\n**Tracks:** ${searchResult.tracks.length}`);
      } else {
        const track = searchResult.tracks[0];
        embed.setDescription(`**[${track.title}](${track.url})**\n**Author:** ${track.author}`);
        
        if (track.artworkUrl) {
          embed.setThumbnail(track.artworkUrl);
        }
      }

      if (!player.playing) {
        player.play();
      }
      
      loadingMsg.edit({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      console.error(error);
      loadingMsg.delete().catch(() => {});
      message.reply(`${config.emojis.error} An error occurred: ${error.message}`);
    }
  },
}; 