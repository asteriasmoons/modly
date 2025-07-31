// commands/ban.js

module.exports = {
  name: "ban",
  description: "Bans a user from the group by user ID, username, or t.me link.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // Admin check with fallback
    try {
      const member = await ctx.getChatMember(chatId, moderatorId);
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

    // Get args
    const args = message.text.split(" ").slice(1);
    if (args.length === 0) {
      return ctx.reply(
        "❗ Usage:\n/ban <user_id | @username | t.me link> [reason]"
      );
    }

    const input = args[0].trim();
    const reason = args.slice(1).join(" ").trim() || "No reason provided";

    // Don't allow banning the group/chat itself
    if (
      input === chatId ||
      input === String(chatId) ||
      input === String(Number(chatId))
    ) {
      return ctx.reply("❌ You cannot ban the chat or group itself.");
    }

    let userId;
    let targetLabel;

    // By username
    if (/^@?[a-zA-Z0-9_]{5,}$/.test(input)) {
      const username = input.replace("@", "");
      try {
        const member = await ctx.getChatMember(chatId, username);
        userId = String(member.user.id);
        targetLabel = `@${username} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (username) failed:", err);
        return ctx.reply("❌ Username not found in this group.");
      }
    }
    // By t.me link
    else if (/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(input)) {
      const username = input.split("/").pop();
      try {
        const member = await ctx.getChatMember(chatId, username);
        userId = String(member.user.id);
        targetLabel = `@${username} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (link) failed:", err);
        return ctx.reply("❌ User from link not found in this group.");
      }
    }
    // By raw user ID
    else if (/^-?\d{5,}$/.test(input)) {
      if (input === chatId || input === String(chatId)) {
        return ctx.reply("❌ That's the group ID, not a user.");
      }
      try {
        const member = await ctx.getChatMember(chatId, input);
        userId = String(member.user.id);
        targetLabel = `${member.user.first_name} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (user ID) failed:", err);
        return ctx.reply("❌ User ID not found in this group.");
      }
    } else {
      return ctx.reply(
        "❌ Invalid input. Use a user ID, @username, or t.me link."
      );
    }

    // Final debug print for testing (remove later!)
    console.log({
      chatId,
      input,
      userId,
      targetLabel,
      reason,
    });

    // Ban user
    try {
      await ctx.banChatMember(userId);
      await ctx.reply(`🔨 Banned ${targetLabel}\nReason: ${reason}`, {
        parse_mode: "Markdown",
      });
    } catch (err) {
      console.error("❌ Failed to ban user:", err);
      await ctx.reply("❌ Failed to ban user. I may not have permission.");
    }
  },
};