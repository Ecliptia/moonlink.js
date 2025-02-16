const { data } = require("./search");

module.exports = {
    data: {
        name: "join",
        description: "Join a voice channel",
    },
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("You need to be in a voice channel to use this command.");
        }

        const player = client.manager.createPlayer({
            guildId: message.guild.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: message.channel.id,
        });

        player.connect();
        message.reply("Joined your voice channel!");
    },
}