// commands/clearwarns.js

const Warning = require("../models/Warning");

module.exports = {
  name: "clearwarns",
  description: "Clears all warnings for a user in this chat.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const adminId = String(message.from.id);

    // Try-catch for admin check
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

    if (!message.reply_to_message) {
      return ctx.reply(
        "❗ You must reply to the user whose warnings you want to clear."
      );
    }

    const targetUser = message.reply_to_message.from;
    const userId = String(targetUser.id);

    const result = await Warning.deleteMany({ userId, chatId });

    if (result.deletedCount > 0) {
      ctx.reply(
        `✅ Cleared ${result.deletedCount} warning(s) for ${targetUser.first_name}.`
      );
    } else {
      ctx.reply(`ℹ️ ${targetUser.first_name} has no warnings to clear.`);
    }
  },
};