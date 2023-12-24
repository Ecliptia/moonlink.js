const {
  Writable
} = require('stream');
const fs = require('fs');
const {
  exec
} = require('child_process');

const audioChunks = [];
const writableStream = new Writable({
  write: (chunk, encoding, callback) => {
    audioChunks.push(chunk)
    callback();
  },
  final: async(callback) => {
    const audioBuffer = Buffer.concat(audioChunks);
    const pcmFilePath = 'output.pcm';

    const ffmpegCommand = `ffmpeg -f s16le -ar 48000 -ac 2 -i pipe:0 ${pcmFilePath}`;

    const ffmpegProcess = await exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during FFmpeg conversion: ${error.message}`);
        callback(error);
      } else {
        console.log(`PCM file saved successfully: ${pcmFilePath}`);
        callback();
      }
    });
    ffmpegProcess.stdin.write(audioBuffer);
    ffmpegProcess.stdin.end();
  },
});


module.exports = {
  name: "test",
  aliases: ["t"],
  run: async (client, message, args) => {
    const player = client.moon.players.create({
      guildId: message.guild.id,
      textChannel: message.channel.id,
      voiceChannel: message.member.voice.channel.id,
    });

    if (!player.connected) {
      player.connect({
        setDeaf: false,
        setMute: false,
      });
    }

    player.receive.on("startSpeaking", (data) => {});
    player.receive.on("audioChunk", (data) => {
      const audioChunk = Buffer.from(data.chunk, 'base64');
      writableStream.write(audioChunk);
    });
    player.receive.on("close", () => {
      writableStream.end();
    });

    player.receive.start();
    console.log('rec...');
  },
};