// commands/warn.js

const Warning = require("../models/Warning");

module.exports = {
  name: "warn",
  description: "Warns a user and stores it in the database.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // Only admins can use this command
    const member = await ctx.telegram.getChatMember(chatId, moderatorId);
    if (member.status !== "creator" && member.status !== "administrator") {
      return ctx.reply("🚫 You must be an admin to use this command.");
    }

    // Make sure a user is replied to
    if (!message.reply_to_message) {
      return ctx.reply("❗ You must reply to the user you want to warn.");
    }

    const warnedUser = message.reply_to_message.from;
    const userId = String(warnedUser.id);

    // Get the reason from the command text
    const input = message.text.split(" ").slice(1).join(" ").trim();
    const reason = input || "No reason provided";

    // Save the warning in MongoDB
    const newWarning = new Warning({
      userId,
      chatId,
      moderatorId,
      reason,
    });

    await newWarning.save();

    // Count total warnings for that user in this chat
    const warningCount = await Warning.countDocuments({ userId, chatId });

    await ctx.reply(
      `⚠️ ${warnedUser.first_name} has been warned.\nReason: ${reason}\nTotal Warnings: ${warningCount}`
    );
  },
};