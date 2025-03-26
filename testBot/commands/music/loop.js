const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "loop",
    description: "Set the loop mode",
    aliases: ["repeat"]
  },
  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player) {
      return message.reply(`${config.emojis.error} There is nothing playing in this server!`);
    }
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(`${config.emojis.error} You need to be in a voice channel to use this command!`);
    }
    
    if (voiceChannel.id !== player.voiceChannelId) {
      return message.reply(`${config.emojis.error} You need to be in the same voice channel as the bot to use this command!`);
    }
    
    const modes = {
      off: "off",
      track: "track",
      queue: "queue"
    };
    
    let mode = args[0]?.toLowerCase();
    
    if (!mode) {
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.info} Current loop mode: **${player.loop}**`)
        .setColor(config.colors.info);
      
      return message.channel.send({ embeds: [embed] });
    }
    
    if (!Object.keys(modes).includes(mode)) {
      return message.reply(`${config.emojis.error} Invalid loop mode! Available modes: \`off\`, \`track\`, \`queue\``);
    }
    
    player.setLoop(modes[mode]);
    
    const emoji = mode === "track" ? config.emojis.repeatOne : mode === "queue" ? config.emojis.repeat : config.emojis.stop;
    
    const embed = new EmbedBuilder()
      .setDescription(`${emoji} Loop mode set to: **${mode}**`)
      .setColor(config.colors.success);
    
    message.channel.send({ embeds: [embed] });
  },
}; 