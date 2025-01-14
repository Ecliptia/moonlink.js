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
      host: "127.0.0.1",
      secure: false,
      port: 3000,
      password: "pwd",
      pathVersion: "v4",
    },
  ],
  options: {
    clientName: "TRISTAR/1.1",
    NodeLinkFeatures: true,
    previousInArray: true,
    logFile: {
      log: true,
      path: "moonlink.log",
    },
    autoResume: true,
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
console.log(
  decodeTrack(
    "QAAAAAMAHyhGUkVFKSBSJkIgdHlwZSBCZWF0IC0gIlNoaXZlciIADUN5Y2xvcGUgQmVhdHoAAAAAAAKrmAALZDE5aWVhR2ttdUkAAQAraHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kMTlpZWFHa211SQEAMGh0dHBzOi8vaS55dGltZy5jb20vdmkvZDE5aWVhR2ttdUkvbXFkZWZhdWx0LmpwZwAAB3lvdXR1YmUAAAAAAAAAAA=="
  )
);
client.login(process.env.TOKEN).catch(console.error);
