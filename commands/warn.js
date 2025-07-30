// commands/warn.js

const Warning = require("../models/Warning");

module.exports = {
  name: "warn",
  description: "Warns a user and stores it in the database.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // ✅ Admin check with fallback
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

    let userId;
    let warnedName;
    let reason;

    // 🧷 OPTION 1: Reply to user
    if (message.reply_to_message) {
      const targetUser = message.reply_to_message.from;
      userId = String(targetUser.id);
      warnedName = targetUser.first_name;
      reason =
        message.text.split(" ").slice(1).join(" ").trim() ||
        "No reason provided";
    } else {
      // 🧷 OPTION 2: ID, @username, or link
      const args = message.text.split(" ").slice(1);
      if (args.length === 0) {
        return ctx.reply(
          "❗ Usage:\n- Reply to a user with /warn [reason]\n- /warn <user_id | @username | link> [reason]"
        );
      }

      const input = args[0];
      reason = args.slice(1).join(" ").trim() || "No reason provided";

      if (/^@?[a-zA-Z0-9_]{5,}$/.test(input)) {
        // Username
        const username = input.replace("@", "");
        try {
          const user = await ctx.telegram.getChat(`@${username}`);
          userId = String(user.id);
          warnedName = `@${username}`;
        } catch (err) {
          return ctx.reply("❌ Could not find that username.");
        }
      } else if (/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(input)) {
        // Link
        const username = input.split("/").pop();
        try {
          const user = await ctx.telegram.getChat(`@${username}`);
          userId = String(user.id);
          warnedName = `@${username}`;
        } catch (err) {
          return ctx.reply("❌ Could not resolve user from link.");
        }
      } else if (/^\d{5,}$/.test(input)) {
        // User ID
        userId = input;
        warnedName = `User ID: ${userId}`;
      } else {
        return ctx.reply(
          "❌ Invalid user identifier. Use a reply, @username, ID, or t.me link."
        );
      }
    }

    // Save to MongoDB
    const newWarning = new Warning({
      userId,
      chatId,
      moderatorId,
      reason,
    });

    await newWarning.save();

    const warningCount = await Warning.countDocuments({ userId, chatId });

    await ctx.reply(
      `⚠️ Warned ${warnedName} (ID: \`${userId}\`)\nReason: ${reason}\nTotal Warnings: ${warningCount}`,
      { parse_mode: "Markdown" }
    );
  },
};