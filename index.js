const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const REQUIRED_CHANNELS_RAW = process.env.REQUIRED_CHANNELS;

if (!BOT_TOKEN || !REQUIRED_CHANNELS_RAW) {
  throw new Error("ENV belum lengkap");
}

function parseChannels(raw) {
  return raw.split(",").map(v => {
    const [chat, link] = v.split("|");
    return { chat: chat.trim(), link: link.trim() };
  });
}

const REQUIRED_CHANNELS = parseChannels(REQUIRED_CHANNELS_RAW);
const bot = new Telegraf(BOT_TOKEN);

async function checkJoin(ctx, userId) {
  const notJoined = [];
  for (const ch of REQUIRED_CHANNELS) {
    try {
      const m = await ctx.telegram.getChatMember(ch.chat, userId);
      if (!["member", "administrator", "creator"].includes(m.status)) {
        notJoined.push(ch);
      }
    } catch {
      notJoined.push(ch);
    }
  }
  return notJoined;
}

bot.start(async (ctx) => {
  const notJoined = await checkJoin(ctx, ctx.from.id);
  if (notJoined.length > 0) {
    return ctx.reply(
      "🔒 WAJIB join semua channel dulu",
      Markup.inlineKeyboard([
        ...notJoined.map((c, i) => [
          Markup.button.url(`Join Channel ${i + 1}`, c.link)
        ]),
        [Markup.button.callback("🔓 Saya sudah join", "CHECK")]
      ])
    );
  }
  ctx.reply("✅ Akses dibuka", Markup.inlineKeyboard([
    [Markup.button.callback("🤤💋disini crotcrotnya🤤💋", "OPEN")]
  ]));
});

bot.action("CHECK", async (ctx) => {
  const notJoined = await checkJoin(ctx, ctx.from.id);
  if (notJoined.length > 0) {
    return ctx.answerCbQuery("Masih ada channel yang belum di-join ❌", { show_alert: true });
  }
  ctx.editMessageText("✅ Semua channel sudah di-join", Markup.inlineKeyboard([
    [Markup.button.callback("🤤 disini crotcrotnya 🤤", "OPEN")]
  ]));
});

bot.action("OPEN", async (ctx) => {
  ctx.reply("https://t.me/+EifErCya00cyMjE9");
});

bot.launch();
console.log("🤖 Bot jalan...");
