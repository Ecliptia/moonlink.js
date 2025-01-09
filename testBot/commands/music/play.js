module.exports = {
    data: {
      name: "play",
    },
    async execute(client, message, args) {
      const channel = message.member.voice.channel;
      if (!channel) return message.reply("You need to join a voice channel first!");
      if (!args[0]) return message.reply("You need to provide a song or URL!");
  
      let player = client.manager.players.get(message.guild.id) || client.manager.createPlayer({
        guildId: message.guild.id,
        voiceChannelId: channel.id,
        textChannelId: message.channel.id,
      });
  
      if (!player.connected) player.connect({ setDeaf: true });
  
      const searchResult = await client.manager.search({ query: args.join(" ") });
      if (!searchResult.tracks.length) return message.reply("No results found.");
  
      player.queue.add(searchResult.tracks[0]);
      if (!player.playing) player.play();
      await message.reply(`Playing track: ${searchResult.tracks[0].title}`);
    },
  };
  