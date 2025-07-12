module.exports = {
    data: {
        name: "getcategories",
        description: "Gets the current SponsorBlock categories for the player.",
        category: "sponsor",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            return message.channel.send("There is no player in this guild.");
        }

        try {
            const categories = await player.getSponsorBlockCategories();
            if (categories.length > 0) {
                message.channel.send(`Current SponsorBlock categories: ${categories.join(", ")}`);
            } else {
                message.channel.send("No SponsorBlock categories are currently set.");
            }
        } catch (error) {
            console.error("Error getting SponsorBlock categories:", error);
            message.channel.send("An error occurred while trying to get SponsorBlock categories.");
        }
    },
};