// commands/getid.js
module.exports = {
  name: "getid",
  description: "Returns your Telegram user ID.",
  async execute(ctx) {
    const userId = ctx.from.id;
    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : ctx.from.first_name;

    await ctx.reply(
      `🪪 Your Telegram ID is:\n\`${userId}\`\n(Hello, ${username}!)`,
      {
        parse_mode: "Markdown",
      }
    );
  },
};