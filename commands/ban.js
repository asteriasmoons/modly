// commands/ban.js
module.exports = {
  name: "ban",
  description: "Bans a user by @mention or numeric user ID.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = message.chat.id;
    const moderatorId = message.from.id;

    // Admin check with fallback for dev
    try {
      const member = await ctx.getChatMember(chatId, moderatorId);
      if (!["creator", "administrator"].includes(member.status)) {
        return ctx.reply("🚫 You must be an admin to use this command.");
      }
    } catch (err) {}

    const args = message.text.split(" ").slice(1);
    if (args.length === 0) {
      return ctx.reply(
        "❗ Usage:\n/ban @username [reason]\n/ban <user_id> [reason]"
      );
    }

    let userId = null;
    let targetLabel = null;
    let reason = args.slice(1).join(" ").trim() || "No reason provided";

    // 1. Check for a mention entity
    if (message.entities) {
      const mentionEntity = message.entities.find(
        (e) =>
          (e.type === "text_mention" || e.type === "mention") &&
          e.offset === message.text.indexOf(args[0])
      );
      if (
        mentionEntity &&
        mentionEntity.type === "text_mention" &&
        mentionEntity.user
      ) {
        userId = mentionEntity.user.id;
        targetLabel = `${mentionEntity.user.first_name} (ID: \`${userId}\`)`;
      } else if (mentionEntity && mentionEntity.type === "mention") {
        // We have @username, now resolve to user ID from group members
        const username = args[0].replace("@", "");
        try {
          const member = await ctx.getChatMember(chatId, username);
          userId = member.user.id;
          targetLabel = `@${username} (ID: \`${userId}\`)`;
        } catch {
          return ctx.reply("❌ Username not found in this group.");
        }
      }
    }

    // 2. If not a mention, try to parse as a user ID
    if (!userId && /^\d{5,}$/.test(args[0])) {
      userId = args[0];
      try {
        const member = await ctx.getChatMember(chatId, userId);
        targetLabel = `${member.user.first_name} (ID: \`${userId}\`)`;
      } catch {
        return ctx.reply("❌ User ID not found in this group.");
      }
    }

    if (!userId) {
      return ctx.reply(
        "❌ Could not find user. Tag them or use their user ID."
      );
    }

    try {
      await ctx.banChatMember(userId);
      await ctx.reply(`🔨 Banned ${targetLabel}\nReason: ${reason}`, {
        parse_mode: "Markdown",
      });
    } catch (err) {
      await ctx.reply("❌ Failed to ban user. I may not have permission.");
    }
  },
};