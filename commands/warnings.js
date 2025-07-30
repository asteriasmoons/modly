// commands/warnings.js

const Warning = require("../models/Warning");

module.exports = {
  name: "warnings",
  description: "Displays all warnings for a user in this chat.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);

    // Make sure the command is a reply
    if (!message.reply_to_message) {
      return ctx.reply(
        "❗ You must reply to the user whose warnings you want to see."
      );
    }

    const targetUser = message.reply_to_message.from;
    const userId = String(targetUser.id);

    const warnings = await Warning.find({ userId, chatId });

    if (warnings.length === 0) {
      return ctx.reply(`✅ ${targetUser.first_name} has no warnings.`);
    }

    // Build a list of reasons and moderators
    const warningList = warnings
      .map(
        (w, i) =>
          `#${i + 1} — ${w.reason} (by ID: ${
            w.moderatorId
          } on ${w.timestamp.toLocaleDateString()})`
      )
      .join("\n");

    await ctx.reply(
      `⚠️ Warnings for ${targetUser.first_name} (${warnings.length} total):\n\n${warningList}`
    );
  },
};