import express from "express";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAME_SHORT_NAME = "VoteForStaines";
const GAME_URL_BASE  = "https://stainesdegr8.github.io/VOTEFORSTAINES/";

if (!BOT_TOKEN) { console.error("BOT_TOKEN not set"); process.exit(1); }

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// allow game page to call us
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if (req.method==="OPTIONS") return res.sendStatus(204);
  next();
});

// DM: /start shows the game card
bot.start((ctx)=>ctx.replyWithGame(GAME_SHORT_NAME));

// GROUPS: /play posts the game card into the group
bot.command('play', (ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// When user taps Play, send game URL with IDs we need for setGameScore
bot.on("callback_query", async (ctx)=>{
  const cq = ctx.callbackQuery;
  if (cq.game_short_name !== GAME_SHORT_NAME) return ctx.answerCbQuery();

  const u = cq.from.id;
  const p = new URLSearchParams({ u: String(u) });

  if (cq.inline_message_id) {
    p.set("i", cq.inline_message_id);                 // inline message
  } else if (cq.message) {
    p.set("c", String(cq.message.chat.id));           // normal message
    p.set("m", String(cq.message.message_id));
  }

  const url = `${GAME_URL_BASE}?${p.toString()}`;
  await ctx.answerGameQuery(url);
});

// Game calls this to auto-set score (no popup)
app.post("/setscore", async (req, res) => {
  try {
    const { score, u, c, m, i } = req.body || {};
    if (score === undefined || u === undefined) {
      return res.status(400).json({ ok:false, error:"Missing score or u" });
    }
    const opts = i ? { inline_message_id: i } : { chat_id: Number(c), message_id: Number(m) };
    const result = await bot.telegram.setGameScore(Number(u), Number(score), {
      ...opts, force: true, disable_edit_message: false
    });
    res.json({ ok:true, result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, async ()=>{
  console.log(`HTTP listening on :${PORT}`);
  await bot.launch();
  console.log("Bot polling started");
});

process.once("SIGINT", ()=>bot.stop("SIGINT"));
process.once("SIGTERM", ()=>bot.stop("SIGTERM"));
