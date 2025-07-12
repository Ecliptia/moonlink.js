const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: {
        name: "subscribelyrics",
        description: "Subscribes to live lyrics for the current playing track.",
        category: "music",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        if (!player || !player.current) {
            return message.reply("There is no track playing in this guild.");
        }

        const lyricsEmbed = new EmbedBuilder()
            .setTitle(`Live Lyrics for ${player.current.title}`)
            .setDescription("Waiting for lyrics...")
            .setColor(config.colors.info);

        const lyricsMessage = await message.channel.send({ embeds: [lyricsEmbed] });

        try {
            await player.subscribeLyrics((line) => {
                lyricsEmbed.setDescription(line.line);
                lyricsMessage.edit({ embeds: [lyricsEmbed] }).catch(console.error);
            });
            message.channel.send("Successfully subscribed to live lyrics. Lyrics will appear above.");
        } catch (error) {
            console.error("Error subscribing to live lyrics:", error);
            lyricsMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${config.emojis.error} An error occurred while trying to subscribe to live lyrics: ${error.message}`)
                        .setColor(config.colors.error)
                ]
            }).catch(console.error);
        }
    },
};