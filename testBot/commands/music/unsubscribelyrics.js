module.exports = {
    data: {
        name: "unsubscribelyrics",
        description: "Unsubscribes from live lyrics.",
        category: "music",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            return message.reply("There is no player in this guild.");
        }

        try {
            await player.unsubscribeLyrics();
            message.channel.send("Successfully unsubscribed from live lyrics.");
        } catch (error) {
            console.error("Error unsubscribing from live lyrics:", error);
            message.channel.send(`An error occurred while trying to unsubscribe from live lyrics: ${error.message}`);
        }
    },
};