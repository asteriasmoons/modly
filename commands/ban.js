// commands/ban.js
module.exports = {
  name: "ban",
  description: "Bans a user from the group.",
  async execute(ctx) {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const moderatorId = String(message.from.id);

    // Improved admin check with fallback
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

    if (!message.reply_to_message) {
      return ctx.reply("❗ You must reply to the user you want to ban.");
    }

    const targetUser = message.reply_to_message.from;
    const userId = targetUser.id;
    const reason =
      message.text.split(" ").slice(1).join(" ").trim() || "No reason provided";

    try {
      await ctx.banChatMember(userId);
      await ctx.reply(
        `🔨 Banned ${targetUser.first_name} (ID: \`${userId}\`) \nReason: ${reason}`,
        {
          parse_mode: "Markdown",
        }
      );
    } catch (err) {
      console.error("❌ Failed to ban user:", err);
      await ctx.reply(
        "❌ Failed to ban user. Maybe I don’t have the right permissions?"
      );
    }
  },
};