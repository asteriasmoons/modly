// commands/ban.js

module.exports = {
  name: "ban",
  description: "Bans a user from the group by user ID, username, or link.",
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

    const args = message.text.split(" ").slice(1);
    if (args.length === 0) {
      return ctx.reply(
        "❗ Usage:\n/ban <user_id | @username | t.me link> [reason]"
      );
    }

    const input = args[0].trim();
    const reason = args.slice(1).join(" ").trim() || "No reason provided";
    let userId;
    let targetLabel;

    // Block banning the group username
    const groupUsername = ctx.chat.username
      ? ctx.chat.username.toLowerCase()
      : null;

    if (/^@?[a-zA-Z0-9_]{5,}$/.test(input)) {
      // @username
      const username = input.replace("@", "");
      if (groupUsername && username.toLowerCase() === groupUsername) {
        return ctx.reply("❌ You cannot ban the group username.");
      }
      try {
        const member = await ctx.getChatMember(chatId, username);
        userId = String(member.user.id);
        targetLabel = `@${username} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (username) failed:", err);
        return ctx.reply("❌ Username not found in this group.");
      }
    } else if (/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(input)) {
      const username = input.split("/").pop();
      if (groupUsername && username.toLowerCase() === groupUsername) {
        return ctx.reply("❌ You cannot ban the group username.");
      }
      try {
        const member = await ctx.getChatMember(chatId, username);
        userId = String(member.user.id);
        targetLabel = `@${username} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (link) failed:", err);
        return ctx.reply("❌ User from link not found in this group.");
      }
    } else if (/^-?\d{5,}$/.test(input)) {
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