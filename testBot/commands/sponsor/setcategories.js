module.exports = {
    data: {
        name: "setcategories",
        description: "Sets the SponsorBlock categories for the player. Usage: setcategories <category1> <category2> ...",
        category: "sponsor",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            return message.channel.send("There is no player in this guild.");
        }

        if (args.length === 0) {
            return message.channel.send("Please provide at least one category to set.");
        }

        const categories = args;

        try {
            await player.setSponsorBlockCategories(categories);
            message.channel.send(`SponsorBlock categories set to: ${categories.join(", ")}`);
        } catch (error) {
            console.error("Error setting SponsorBlock categories:", error);
            message.channel.send("An error occurred while trying to set SponsorBlock categories.");
        }
    },
};