// commands/warn.js

const Warning = require("../models/Warning");

module.exports = {
  name: "warn",
  description: "Warns a user and stores it in the database.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // Try-catch for admin check
    try {
      const member = await ctx.telegram.getChatMember(chatId, moderatorId);
      const allowed = ["creator", "administrator"];

      if (!allowed.includes(member.status)) {
        if (moderatorId !== chatId) {
          return ctx.reply("🚫 You must be an admin to use this command.");
        }
      }
    } catch (err) {
      console.warn("⚠️ Skipping admin check due to error:", err.message);
    }

    if (!message.reply_to_message) {
      return ctx.reply("❗ You must reply to the user you want to warn.");
    }

    const warnedUser = message.reply_to_message.from;
    const userId = String(warnedUser.id);

    const input = message.text.split(" ").slice(1).join(" ").trim();
    const reason = input || "No reason provided";

    const newWarning = new Warning({
      userId,
      chatId,
      moderatorId,
      reason,
    });

    await newWarning.save();

    const warningCount = await Warning.countDocuments({ userId, chatId });

    await ctx.reply(
      `⚠️ ${warnedUser.first_name} has been warned.\nReason: ${reason}\nTotal Warnings: ${warningCount}`
    );
  },
};