// commands/unban.js

module.exports = {
  name: "unban",
  description: "Unbans a user by Telegram ID.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const adminId = String(message.from.id);

    // Improved admin check with fallback
    try {
      const member = await ctx.getChatMember(moderatorId);

      if (!["creator", "administrator"].includes(member.status)) {
        if (chatId !== moderatorId) {
          return ctx.reply("🚫 You must be an admin to use this command.");
        }
      }
    } catch (err) {
      console.warn(
        "⚠️ Could not confirm admin status, allowing action for dev mode."
      );
    }

    const args = message.text.split(" ").slice(1);
    if (args.length === 0) {
      return ctx.reply("❗ Usage: /unban <user_id>");
    }

    const userId = args[0];

    try {
      await ctx.unbanChatMember(userId);
      await ctx.reply(`✅ Unbanned user with ID: \`${userId}\``, {
        parse_mode: "Markdown",
      });
    } catch (err) {
      console.error("❌ Failed to unban user:", err);
      await ctx.reply(
        "❌ Failed to unban user. I may not have the right permissions."
      );
    }
  },
};