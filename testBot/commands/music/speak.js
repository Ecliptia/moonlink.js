const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: {
    name: "speak",
    description: "Makes the bot speak a message using Skybot TTS",
    aliases: ["sptts"]
  },
  async execute(client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply(`${config.emojis.error} You need to join a voice channel first!`);

    const text = args.join(" ");
    if (!text) return message.reply(`${config.emojis.error} You need to provide a message to speak!`);

    const MAX_LENGTH = 200;
    if (text.length > MAX_LENGTH) {
      return message.reply(`${config.emojis.error} Your message exceeds the ${MAX_LENGTH}-character limit.`);
    }

    let player =
      client.manager.players.get(message.guild.id) ||
      client.manager.createPlayer({
        guildId: message.guild.id,
        voiceChannelId: channel.id,
        textChannelId: message.channel.id,
      });

    if (!player.connected) {
      player.connect({ setDeaf: true });
    }

    try {
      const success = await player.speak({
        text: text,
        provider: 'skybot',
        addToQueue: false
      });

      if (success) {
        const embed = new EmbedBuilder()
          .setDescription(`${config.emojis.success} Speaking: \`${text}\``)
          .setColor(config.colors.success);
        message.reply({ embeds: [embed] });
      } else {
        message.reply(`${config.emojis.error} Failed to make the bot speak. Make sure a Skybot-compatible node is connected and supports 'speak' capability.`);
      }
    } catch (error) {
      console.error(error);
      message.reply(`${config.emojis.error} An error occurred: ${error.message}`);
    }
  },
};
