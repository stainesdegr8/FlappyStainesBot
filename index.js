import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN; // we will set this later on Render
const GAME_SHORT_NAME = "VoteForStaines"; // your BotFather short name
const GAME_URL = "https://stainesdegr8.github.io/VOTEFORSTAINES/"; // your GitHub Pages link

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN not set");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// When you DM the bot with /start, it shows the game card
bot.start((ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// When user taps the game card, open your hosted game
bot.on("callback_query", (ctx) => {
  if (ctx.callbackQuery.game_short_name === GAME_SHORT_NAME) {
    return ctx.answerGameQuery(GAME_URL);
  }
  return ctx.answerCbQuery();
});

bot.launch();
console.log("✅ Bot running...");
