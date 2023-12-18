const {
  Client,
  Collection
} = require("discord.js");
const {
  MoonlinkManager
} = require("../dist/index.js");
const fs = require("fs");
const path = require("path");
const http = require("http");
const log = (message) => {
  const coloredMessage = message.replace(/\[(.*?)\]/g, "\x1b[34m[$1]\x1b[0m");
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
    host: require("../config.json").host,
    port: 443,
    secure: true,
    password: require("../config.json").password,
  },
  ],
  {
    autoResume: true,
    clientName: "Moonlink/Blio",
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
  const commandName = args.shift().toLowerCase();

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
client.moon.on("nodeCreate", (node) =>
  log(`[ Moonlink/Event ]: Node created: ${node.identifier || node.host}`),
);

client.on("error", (error) => {
  log(`[ Client ]: Client error: ${error}`);
});

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });
  res.end("Hello, World!\n");
});

/*
server.listen(80, () => {
  log(`[ Server ]: Server running;`);
});
*/ 
const token = require ("../config.json").token;
if (!token) {
  console.error(
    "[ System ]: Please provide a valid TOKEN in the environment variables.",
  );
} else {
  client.login(token);
}