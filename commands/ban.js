// commands/ban.js

module.exports = {
  name: "ban",
  description:
    "Bans a user from the group by reply, user ID, username, or link.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // ✅ Improved admin check with fallback
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
    let targetLabel;
    let reason;

    // 🧷 OPTION 1: Reply-based
    if (message.reply_to_message) {
      const targetUser = message.reply_to_message.from;
      userId = targetUser.id;
      targetLabel = `${targetUser.first_name} (ID: \`${userId}\`)`;
      reason =
        message.text.split(" ").slice(1).join(" ").trim() ||
        "No reason provided";
    } else {
      // 🧷 OPTION 2: ID, @username, or link
      const args = message.text.split(" ").slice(1);
	  if (args.length === 0) {
      return ctx.reply(
        "❗ Usage:\n/ban <user_id | @username | t.me link> [reason]"
      );
    }

      const input = args[0];
      reason = args.slice(1).join(" ").trim() || "No reason provided";

      if (/^@?[a-zA-Z0-9_]{5,}$/.test(input)) {
        // @username — check if they're in the group
        const username = input.replace("@", "");
        try {
          const member = await ctx.getChatMember(username);
          userId = String(member.user.id);
          targetLabel = `@${username} (ID: \`${userId}\`)`;
        } catch (err) {
          return ctx.reply("❌ Could not find that username in this group.");
        }
      } else if (/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(input)) {
        // t.me link
        const username = input.split("/").pop();
        try {
          const member = await ctx.getChatMember(username);
          userId = String(member.user.id);
          targetLabel = `@${username} (ID: \`${userId}\`)`;
        } catch (err) {
          return ctx.reply(
            "❌ Could not resolve user from link — make sure they’re in the group."
          );
        }
      } else if (/^\d{5,}$/.test(input)) {
        // Raw user ID
        userId = input;
        targetLabel = `User ID: \`${userId}\``;
      } else {
        return ctx.reply(
          "❌ Invalid user identifier. Use a reply, @username, ID, or t.me link."
        );
      }
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