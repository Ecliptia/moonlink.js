const { EmbedBuilder } = require("discord.js")
const config = require("../../config");

module.exports = {
    data: {
        name: "subscribelyrics",
        description: "Subscribes to live lyrics for the current playing track.",
        category: "music",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        let provider = "java-lyrics-plugin";
        const providerIndex = args.indexOf("--provider");
        if (providerIndex !== -1 && args.length > providerIndex + 1) {
            provider = args[providerIndex + 1];
        }

        if (!player || !player.current) {
            return message.reply("There is no track playing in this guild.");
        }

        const loadingEmbed = new EmbedBuilder()
            .setDescription(`${config.emojis.loading} Fetching lyrics...`)
            .setColor(config.colors.info);

        const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });

        try {
            const fullLyrics = await client.manager.getLyrics({
                player: player,
                provider: provider,
            });

            if (!fullLyrics || !fullLyrics.lines || fullLyrics.lines.length === 0) {
                loadingMsg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${config.emojis.error} No timed lyrics found for the current song.`)
                            .setColor(config.colors.error)
                    ]
                }).catch(console.error);
                return;
            }

            const lyricsEmbed = new EmbedBuilder()
                .setTitle(`Live Lyrics for ${player.current.title}`)
                .setColor(config.colors.info);

            // Initial display of lyrics
            const initialLineIndex = fullLyrics.lines.findIndex(line => player.current.position >= line.timestamp && player.current.position < (line.timestamp + (line.duration || 0)));
            const initialDisplay = formatLyricsDisplay(fullLyrics.lines, initialLineIndex);
            lyricsEmbed.setDescription(initialDisplay);
            await loadingMsg.edit({ embeds: [lyricsEmbed] });

            await player.subscribeLyrics((line) => {
                const currentLineIndex = fullLyrics.lines.findIndex(l => l.timestamp === line.timestamp && l.line === line.line); // Find the index of the current line
                const displayContent = formatLyricsDisplay(fullLyrics.lines, currentLineIndex);
                lyricsEmbed.setDescription(displayContent);
                loadingMsg.edit({ embeds: [lyricsEmbed] }).catch(console.error);
            }, false, provider);

            message.channel.send("Successfully subscribed to live lyrics. Lyrics will appear above.");

        } catch (error) {
            console.error("Error subscribing to live lyrics:", error);
            loadingMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${config.emojis.error} An error occurred while trying to subscribe to live lyrics: ${error.message}`)
                        .setColor(config.colors.error)
                ]
            }).catch(console.error);
        }
    },
};

function formatLyricsDisplay(allLines, currentIndex) {
    const numLinesToShow = 9;
    const linesAround = Math.floor(numLinesToShow / 2);

    const start = Math.max(0, currentIndex - linesAround);
    const end = Math.min(allLines.length - 1, currentIndex + linesAround);

    let display = "";
    for (let i = start; i <= end; i++) {
        const line = allLines[i];
        if (i === currentIndex) {
            display += `**${line.line}**\n`;
        } else {
            display += `${line.line}\n`;
        }
    }
    return display.trim();
}