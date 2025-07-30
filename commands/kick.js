// commands/kick.js

module.exports = {
  name: "kick",
  description: "Kicks a user from the group (they can rejoin).",
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
      return ctx.reply("❗ You must reply to the user you want to kick.");
    }

    const targetUser = message.reply_to_message.from;
    const userId = targetUser.id;
    const reason =
      message.text.split(" ").slice(1).join(" ").trim() || "No reason provided";

    try {
      await ctx.kickChatMember(userId);
      await ctx.unbanChatMember(userId); // Let them rejoin
      await ctx.reply(
        `👢 Kicked ${targetUser.first_name} (ID: \`${userId}\`) \nReason: ${reason}`,
        {
          parse_mode: "Markdown",
        }
      );
    } catch (err) {
      console.error("❌ Failed to kick user:", err);
      await ctx.reply(
        "❌ Failed to kick user. Maybe I don’t have the right permissions?"
      );
    }
  },
};