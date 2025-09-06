import { Client, Collection, GatewayIntentBits } from "npm:discord.js";
import { Manager } from "../../dist/index.js";
import { config as dotenvConfig } from "npm:dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";

dotenvConfig();
const __dirname = dirname(fileURLToPath(import.meta.url));
const config = await import("../config.js");

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
});

client.manager = new Manager({
  nodes: [
    {
      host: "localhost",
      port: 3000,
      password: "youshallnotpass",
      region: ["brazil"],
      identifier: "MAIN",
      secure: false,
      pathVersion: "v1"
    }
  ],
  options: {
    NodeLinkFeatures: true,
    partialTrack: ["url", "duration", "artworkUrl"],
  },
  sendPayload: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));
  },
});

client.commands = new Collection();

try {
  const commandsPath = join(__dirname, "commands");
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = await import(`file://${filePath}`);
      client.commands.set(command.default.name, command.default);
      console.log(`Command loaded: ${command.default.name}`);
    }
  } else {
    console.error(`Commands directory not found: ${commandsPath}`);
  }
} catch (error) {
  console.error(`Error loading commands: ${error.message}`);
}

client.once("ready", () => {
  client.manager.init(client.user.id);
  console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.content.startsWith(config.default.prefix)) return;

  const args = message.content.slice(config.default.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(client, message, args);
  } catch (error) {
    console.error(error);
    message.reply(`${config.default.emojis.error} An error occurred while executing the command.`);
  }
});

client.manager.on("debug", msg => console.log("[DEBUG]:", msg));
client.on("raw", d => client.manager.packetUpdate(d));

client.login(Deno.env.get("TOKEN") || process.env.TOKEN).catch(console.error); 