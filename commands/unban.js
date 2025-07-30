// commands/unban.js

module.exports = {
  name: "unban",
  description: "Unbans a user by Telegram ID.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const adminId = String(message.from.id);

    // Admin check with dev bypass
    try {
      const admin = await ctx.telegram.getChatMember(chatId, adminId);
      const allowed = ["creator", "administrator"];
      if (!allowed.includes(admin.status)) {
        if (adminId !== chatId) {
          return ctx.reply("🚫 You must be an admin to use this command.");
        }
      }
    } catch (err) {
      console.warn("⚠️ Skipping admin check due to error:", err.message);
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