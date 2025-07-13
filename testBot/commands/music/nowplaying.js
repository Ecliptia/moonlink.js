const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "nowplaying",
    description: "Show information about the current song",
    aliases: ["np", "current"]
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player || !player.current) {
      return message.reply(`${config.emojis.error} There is nothing playing in this server!`);
    }
    
    const track = player.current;
    
    const formatDuration = (ms) => {
      if (ms == Infinity) return 'Live Stream';
      else if (ms == 0) return '00:00';
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor(ms / (1000 * 60 * 60));
      
      return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const createProgressBar = (current, total, length = 15) => {
      const progress = Math.round((current / total) * length);
      return '▬'.repeat(progress) + '🔘' + '▬'.repeat(length - progress);
    };

    console.log(track);
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.emojis.play} Now Playing`)
      .setDescription(`[${track.title}](${track.url})`)
      .addFields(
        { name: 'Author', value: track.author, inline: true },
        { name: 'Volume', value: `${player.volume}%`, inline: true },
        { name: 'Requested By', value: `<@${track.requestedBy?.id}>`, inline: true },
        { name: 'Duration', value: `\`${formatDuration(player.current.position ?? 0)} / ${formatDuration(track.duration)}\`\n${createProgressBar(player.position, track.duration)}`, inline: false }
      )
      .setColor(config.colors.player);
    
    if (track.chapters && track.chapters.length > 0) {
      const chapterList = track.chapters.map((chapter, index) => {
        const isCurrent = index === track.currentChapterIndex;
        return `${isCurrent ? '**[CURRENT]** ' : ''}${chapter.name} (${formatDuration(chapter.start)})`;
      }).join("\n");
      embed.addFields({ name: 'Chapters', value: chapterList, inline: false });
    }

    if (track.thumbnail) {
      embed.setThumbnail(track.thumbnail);
    }
    
    message.channel.send({ embeds: [embed] });
  },
}; 