// commands/ban.js

module.exports = {
  name: "ban",
  description: "Bans a user from the group by user ID, username, or link.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // ✅ Admin check with fallback
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

    // 🧷 Get target from ID, username, or t.me link
    const args = message.text.split(" ").slice(1);
    if (args.length === 0) {
      return ctx.reply(
        "❗ Usage:\n/ban <user_id | @username | t.me link> [reason]"
      );
    }

    const input = args[0];
    const reason = args.slice(1).join(" ").trim() || "No reason provided";

    let userId;
    let targetLabel;

    if (/^@?[a-zA-Z0-9_]{5,}$/.test(input)) {
      // @username
      const username = input.replace("@", "");
      try {
        const member = await ctx.getChatMember(chatId, username);
        userId = String(member.user.id);
        targetLabel = `@${username} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (username) failed:", err);
        return ctx.reply("❌ Could not find that username in this group.");
      }
    } else if (/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(input)) {
      // t.me link
      const username = input.split("/").pop();
      try {
        const member = await ctx.getChatMember(chatId, username);
        userId = String(member.user.id);
        targetLabel = `@${username} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (link) failed:", err);
        return ctx.reply(
          "❌ Could not resolve user from link — make sure they’re in the group."
        );
      }
    } else if (/^-?\d{5,}$/.test(input)) {
      // Raw user ID — validate it’s a member
      userId = input;

      if (userId === chatId) {
        return ctx.reply("❌ You cannot ban the chat or group ID.");
      }

      try {
        const member = await ctx.getChatMember(chatId, userId);
        userId = String(member.user.id);
        targetLabel = `${member.user.first_name} (ID: \`${userId}\`)`;
      } catch (err) {
        console.error("❌ getChatMember (user ID) failed:", err);
        return ctx.reply("❌ That ID is not a valid user in this group.");
      }
    } else {
      return ctx.reply(
        "❌ Invalid user identifier. Use a user ID, @username, or t.me link."
      );
    }

    // 🔨 Perform ban
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