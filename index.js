import express from "express";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAME_SHORT_NAME = "VoteForStaines";
const GAME_URL = "https://stainesdegr8.github.io/VOTEFORSTAINES/"; // no query params

if (!BOT_TOKEN) { console.error("BOT_TOKEN not set"); process.exit(1); }

// Tiny HTTP server so Railway stays happy
const app = express();
app.get("/", (_req, res) => res.send("FlappyStainesBot OK"));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`HTTP listening on :${PORT}`));

// Telegram bot: only launches the game, nothing else
const bot = new Telegraf(BOT_TOKEN);

// DM: /start shows the game card
bot.start((ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// Groups: /play posts the game card (optional, keep if you like)
bot.command("play", (ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// When user taps Play, open your static game URL
bot.on("callback_query", (ctx) => {
  const cq = ctx.callbackQuery;
  if (cq.game_short_name === GAME_SHORT_NAME) {
    return ctx.answerGameQuery(GAME_URL);
  }
  return ctx.answerCbQuery();
});

bot.launch().then(() => console.log("Bot polling started"));
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
