const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: {
        name: "join",
        description: "Join a voice channel",
    },
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply(`${config.emojis.error} You need to be in a voice channel to use this command!`);
        }

        const player = client.manager.createPlayer({
            guildId: message.guild.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: message.channel.id,
        });

        player.connect();
        
        const embed = new EmbedBuilder()
            .setDescription(`${config.emojis.success} Joined your voice channel!`)
            .setColor(config.colors.success);
            
        message.channel.send({ embeds: [embed] });
    },
}