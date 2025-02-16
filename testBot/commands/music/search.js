const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "search",
    description: "Search for a song",
  },
  async execute(client, message, args) {
    if (!args.length) {
      return message.channel.send("You need to provide a search term!");
    }

    const searchTerm = args.join(" ");
    const results = await client.manager.search({ query: searchTerm, source: "scsearch" });
    console.log(results);
    if (!results.tracks.length) {
      return message.channel.send("No results found!");
    }

    const embed = new EmbedBuilder()
      .setTitle("Search Results")
      .setDescription(
        results.tracks.map((result, index) => `${index + 1}. ${result.title}`).join("\n")
      )
      .setColor("#FF0000");

    message.channel.send({ embeds: [embed] });
  },
};
