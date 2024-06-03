const {
  Client,
  Collection
} = require("discord.js");
require("dotenv").config();
const {
  MoonlinkManager,
  Plugin,
  makeRequest
} = require("../dist/index.js")

const fs = require("fs");
const path = require("path");
const http = require("http");

const log = (message) => {
  const coloredMessage = message.replace(/\((.*?)\)/g, "\x1b[34m($1)\x1b[0m");
  console.log(coloredMessage);
};


const client = new Client({
  intents: 131071,
});

client.commands = new Collection();

const commandFolders = fs.readdirSync(path.resolve(__dirname, "commands"));

for (const folder of commandFolders) {
  const commandFiles = fs
  .readdirSync(path.resolve(__dirname, `commands/${folder}`))
  .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(
      path.resolve(__dirname, `commands/${folder}/${file}`),
    );

    client.commands.set(command.name, command);
  }
}

client.moon = new MoonlinkManager(
  [{
    host: "localhost",
    port: 2333,
    secure: false,
    identifier: "NODELINK"
  }],
  {
    //http2: true,
    clientName: "Moonlink/Blio"
  },
  (id, data) => {
    let guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(JSON.parse(data));
  },
);

client.on("raw", (data) => client.moon.packetUpdate(data));

client.on("ready", () => {
  log(`[ Client ]: Logged in as: ${client.user.tag}`);
  client.moon.init(client.user.id);
});

client.on("messageCreate", (message) => {
  if (message.author.bot || !message.content.startsWith("?")) return;

  const args = message.content.slice("?".length).trim().split(/ +/);
  const commandName = args.shift();

  const command =
  client.commands.get(commandName) ||
  client.commands.find(
    (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
  );
  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing the command.");
  }
});

client.moon.on("debug", log);

client.on("error", (error) => {
  log(`[ Client ]: Client error: ${error}`);
});

client.login(process.env.TOKEN);