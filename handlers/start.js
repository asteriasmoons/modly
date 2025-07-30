// handlers/start.js
module.exports = (bot) => {
  bot.start((ctx) => {
    ctx.reply(`👋 Hello, ${ctx.from.first_name}! I'm your moderation bot.`);
  });
};