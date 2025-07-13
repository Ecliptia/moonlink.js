module.exports = {
    data: {
        name: "clearcategories",
        description: "Clears all SponsorBlock categories for the player.",
        category: "sponsor",
    },
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            return message.channel.send("There is no player in this guild.");
        }

        try {
            await player.clearSponsorBlockCategories();
            message.channel.send("SponsorBlock categories cleared.");
        } catch (error) {
            console.error("Error clearing SponsorBlock categories:", error);
            message.channel.send("An error occurred while trying to clear SponsorBlock categories.");
        }
    },
};