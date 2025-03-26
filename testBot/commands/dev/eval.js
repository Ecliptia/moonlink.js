const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const { inspect } = require("util");

module.exports = {
  data: {
    name: "eval",
    description: "Evaluate JavaScript code"
  },
  async execute(client, message, args) {
    // Check if user is a developer
    if (!config.devs.includes(message.author.id)) {
      return message.reply(`${config.emojis.error} You do not have permission to use this command!`);
    }
    
    if (!args.length) {
      return message.reply(`${config.emojis.error} Please provide code to evaluate!`);
    }
    
    const code = args.join(" ");
    
    try {
      // Create a clean function to evaluate the code
      const evaled = eval(code);
      const cleaned = await clean(evaled);
      
      // Split the output if it's too long
      const output = cleaned.length > 1990 
        ? `${cleaned.slice(0, 1990)}...` 
        : cleaned;
      
      const embed = new EmbedBuilder()
        .setTitle(`${config.emojis.success} Eval Result`)
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code.length > 1000 ? code.slice(0, 1000) + '...' : code}\n\`\`\`` },
          { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\`` }
        )
        .setColor(config.colors.success)
        .setFooter({ text: `Executed by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle(`${config.emojis.error} Eval Error`)
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code.length > 1000 ? code.slice(0, 1000) + '...' : code}\n\`\`\`` },
          { name: 'Error', value: `\`\`\`js\n${error.message}\n\`\`\`` }
        )
        .setColor(config.colors.error)
        .setFooter({ text: `Executed by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      
      message.channel.send({ embeds: [embed] });
    }
  },
};

async function clean(text) {
  if (text && text.constructor.name == "Promise") {
    text = await text;
  }
  
  if (typeof text !== "string") {
    text = inspect(text, { depth: 0 });
  }
  
  // Remove token from output
  text = text
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203));
  
  // Remove token if it exists in the output
  if (process.env.TOKEN) {
    text = text.replaceAll(process.env.TOKEN, "[REDACTED]");
  }
  
  return text;
} 