// commands/ping.js
module.exports = {
  name: "ping",
  description: "Replies with pong!",
  async execute(ctx) {
    ctx.reply("🏓 Pong!");
  },
};