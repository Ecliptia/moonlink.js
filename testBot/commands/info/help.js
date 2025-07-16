const { EmbedBuilder } = require("discord.js");
const getColors = require("get-image-colors");
const config = require("../../config");

module.exports = {
  data: {
    name: "help",
    description: "Displays all available commands or information about a specific command.",
  },
  async execute(client, message, args) {
    let embedColor = config.colors.info; // Fallback color

    try {
      const colors = await getColors(message.author.displayAvatarURL({ extension: "png", size: 128 }));
      if (colors && colors.length > 0) {
        embedColor = colors[0].hex();
      }
    } catch (error) {
      console.error("Error getting avatar colors:", error);
    }

    const helpEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL({ extension: "png" }),
      });

    if (args.length === 0) {
      // List all commands
      let commandsList = "";
      client.commands.forEach((command) => {
        if (command.data && command.data.name && command.data.description) {
          commandsList += '> **' + command.data.name + '**: ' + command.data.description + '\n';
        }
      });

      helpEmbed.setDescription(
        '**COMMANDS**\n' +
        commandsList +
        '\n' +
        '\nUse `' + config.prefix + 'help <command_name>` for more information on a specific command.'
      );
    } else {
      // Information about a specific command
      const commandName = args[0].toLowerCase();
      const command = client.commands.get(commandName);

      if (!command || !command.data || !command.data.name || !command.data.description) {
        helpEmbed.setDescription('> Command `' + commandName + '` not found.')
      } else {
        let commandInfo = '> **Name**: ' + command.data.name + '\n';
        commandInfo += '> **Description**: ' + command.data.description + '\n';

        if (command.data.options && command.data.options.length > 0) {
          commandInfo += '> **Options**:\n';
          command.data.options.forEach(option => {
            commandInfo += '>   - `' + option.name + '`: ' + option.description + ' (Type: ' + option.type + ')\n';
          });
        }

        helpEmbed.setDescription('**COMMAND DETAILS**\n' + commandInfo);
      }
    }

    message.channel.send({ embeds: [helpEmbed] });
  },
};