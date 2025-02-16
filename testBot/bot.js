const Discord = require("discord.js");
const { Manager, decodeTrack } = require("../dist/index.js");
const fs = require("fs");
require("dotenv").config();

const client = new Discord.Client({
  intents: 131071,
});

client.manager = new Manager({
  nodes: [
    {
      host: "localhost",
      secure: false,
      port: 3000,
      password: "youshallnotpass",
      pathVersion: "v1",
    },
    {
      host: "localhost",
      secure: false,
      port: 2333,
      password: "youshallnotpass",
    }
  ],
  options: {
    clientName: "TRISTAR/1.1",
    NodeLinkFeatures: true,
    previousInArray: true,
    logFile: {
      log: true,
      path: "moonlink.log",
    }
  },
  sendPayload: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));
  },
});

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync("./testBot/commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./testBot/commands/${folder}`)
    .filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

const handleCommand = (client, message) => {
  if (message.author.bot || !message.content.startsWith("?")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return message.reply("Unknown command.");

  try {
    command.execute(client, message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.");
  }
};

client.once("ready", () => {
  client.manager.init(client.user.id);
  console.log(`${client.user.tag} is ready!`);
});

client.manager.on("debug", msg => console.log("[DEBUG]:", msg));
client.on("raw", d => client.manager.packetUpdate(d));
client.on("messageCreate", message => handleCommand(client, message));

client.manager.on("trackStart", (player, track) => {
  console.log(player.current);
});

client.manager.on("trackEnd", (player, track) => {
  console.log(player.current);
});

client.login(process.env.TOKEN).catch(console.error);
