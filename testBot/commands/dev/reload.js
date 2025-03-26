const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: {
    name: "reload",
    description: "Reload a command or all commands"
  },
  async execute(client, message, args) {
    // Check if user is a developer
    if (!config.devs.includes(message.author.id)) {
      return message.reply(`${config.emojis.error} You do not have permission to use this command!`);
    }
    
    if (!args.length) {
      return message.reply(`${config.emojis.error} Please specify a command to reload, or use \`all\` to reload all commands!`);
    }
    
    const commandName = args[0].toLowerCase();
    
    if (commandName === "all") {
      // Reload all commands
      client.commands.clear();
      
      const commandFolders = fs.readdirSync("./testBot/commands");
      let reloadedCount = 0;
      
      for (const folder of commandFolders) {
        const commandFiles = fs
          .readdirSync(`./testBot/commands/${folder}`)
          .filter(file => file.endsWith(".js"));
        
        for (const file of commandFiles) {
          const filePath = `./testBot/commands/${folder}/${file}`;
          delete require.cache[require.resolve(filePath)];
          
          try {
            const command = require(filePath);
            client.commands.set(command.data.name, command);
            reloadedCount++;
          } catch (error) {
            console.error(`Error reloading command ${file}:`, error);
            return message.reply(`${config.emojis.error} Error reloading command ${file}: ${error.message}`);
          }
        }
      }
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.success} Successfully reloaded ${reloadedCount} commands!`)
        .setColor(config.colors.success);
      
      return message.channel.send({ embeds: [embed] });
    }
    
    // Reload a specific command
    const command = client.commands.get(commandName);
    
    if (!command) {
      return message.reply(`${config.emojis.error} There is no command with name \`${commandName}\`!`);
    }
    
    // Find the command file
    let commandPath = null;
    const commandFolders = fs.readdirSync("./testBot/commands");
    
    outerLoop:
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./testBot/commands/${folder}`)
        .filter(file => file.endsWith(".js"));
      
      for (const file of commandFiles) {
        const filePath = `./testBot/commands/${folder}/${file}`;
        const commandFile = require(filePath);
        
        if (commandFile.data.name === commandName) {
          commandPath = filePath;
          break outerLoop;
        }
      }
    }
    
    if (!commandPath) {
      return message.reply(`${config.emojis.error} Could not find the file for command \`${commandName}\`!`);
    }
    
    delete require.cache[require.resolve(commandPath)];
    
    try {
      const newCommand = require(commandPath);
      client.commands.set(newCommand.data.name, newCommand);
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.success} Command \`${newCommand.data.name}\` was reloaded!`)
        .setColor(config.colors.success);
      
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error reloading command ${commandName}:`, error);
      
      const embed = new EmbedBuilder()
        .setDescription(`${config.emojis.error} There was an error while reloading command \`${commandName}\`:\n\`${error.message}\``)
        .setColor(config.colors.error);
      
      message.channel.send({ embeds: [embed] });
    }
  },
}; 