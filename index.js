// index.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🔌 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// 📦 Dynamically load command files from /commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name && typeof command.execute === 'function') {
    bot.command(command.name, (ctx) => command.execute(ctx, bot));
    console.log(`✅ Loaded command: /${command.name}`);
  } else {
    console.warn(`⚠️ Skipped invalid command file: ${file}`);
  }
}

// 🎮 Dynamically load handlers (non-command events) from /handlers
const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
  const handler = require(`./handlers/${file}`);
  if (typeof handler === 'function') {
    handler(bot);
    console.log(`✅ Loaded handler: ${file}`);
  } else {
    console.warn(`⚠️ Skipped invalid handler file: ${file}`);
  }
}

// 🚀 Launch bot
bot.launch().then(() => {
  console.log('🤖 Bot is up and running!');
});

// 💀 Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));