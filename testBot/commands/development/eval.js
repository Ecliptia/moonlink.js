const {
  EmbedBuilder
} = require("discord.js");

const developerIds = ["978981769661513758"];
module.exports = {
  name: "eval",
  aliases: ["e"],
  run: async (client, message, args) => {
    if (!developerIds.includes(message.author.id)) {
      return message.reply("You don't have permission to use this command.");
    }

    let maxDescriptionLength = 4096;
    let maxFieldsLength = 1024;

    try {
      const code = args.join(" ");
      let evaled = await eval(code);

      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
      }

      const embed = new EmbedBuilder().setColor("#302C58");

      if (evaled.length <= maxDescriptionLength) {
        embed.setDescription(`\`\`\`js\n${evaled}\n\`\`\``);
      } else {
        const fields = [];
        while (evaled.length > 0 && fields.length > 10) {
          const fieldValue = evaled.substring(0, maxFieldsLength);
          fields.push({
            name: "\u200B",
            value: `\`\`\`js\n${fieldValue}\n\`\`\``,
          });
          evaled = evaled.substring(maxFieldsLength);
        }
        embed.addFields(fields);
      }

      message.channel.send({
        embeds: [embed]
      });
    } catch (err) {
      const errorEmbed = new EmbedBuilder().setColor("#F23F43");

      if (err.message.length <= maxDescriptionLength) {
        errorEmbed.setDescription(`\`\`\`js\n${err.message}\n\`\`\``);
        console.log(err);
      } else {
        const fields = [];
        while (err.message.length > 0) {
          const fieldValue = err.message.substring(0, maxFieldsLength);
          fields.push({
            name: "\u200B",
            value: `\`\`\`js\n${fieldValue}\n\`\`\``,
          });
          err.message = err.message.substring(maxFieldsLength);
        }
        errorEmbed.addFields(fields);
      }

      message.channel.send({
        embeds: [errorEmbed]
      });
    }
  },
};