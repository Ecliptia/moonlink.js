module.exports = {
    data: {
        name: "skipchapter",
        description: "Skips to a specific chapter or skips a number of chapters. Usage: skipchapter [value] [type (index|count)]",
        category: "music",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            return message.reply("There is no player in this guild.");
        }

        if (!player.current || !player.current.chapters || player.current.chapters.length === 0) {
            return message.reply("There are no chapters available for the current track.");
        }

        let value = 1;
        let type = 'count';

        if (args.length > 0) {
            const parsedValue = parseInt(args[0]);
            if (!isNaN(parsedValue)) {
                value = parsedValue;
            } else {
                return message.reply("Invalid value provided. Please provide a number.");
            }
        }

        if (args.length > 1) {
            const parsedType = args[1].toLowerCase();
            if (parsedType === 'index' || parsedType === 'count') {
                type = parsedType;
            } else {
                return message.reply("Invalid type provided. Please use 'index' or 'count'.");
            }
        }

        try {
            const skipped = await player.skipChapter(value, type);
            if (skipped) {
                const chapterInfo = type === 'index' ? `Chapter index: ${value}` : `Skipped ${value} chapters`;
                message.channel.send(`Successfully skipped chapter. ${chapterInfo}`);
            } else {
                message.channel.send(`Failed to skip chapter. Check if the value and type are valid.`);
            }
        } catch (error) {
            console.error("Error skipping chapter:", error);
            message.channel.send("An error occurred while trying to skip the chapter.");
        }
    },
};