
require("dotenv").config(); // .env faylini yuklash
const { Bot, session, Keyboard } = require("grammy"); // grammy bot kutubxonasi
const { initDatabase, updateLeaderboard } = require("./database"); // database.js funksiyalari
const { loadQuestions, getRandomQuestion } = require("./questions"); // questions.js funksiyalari
const { startQuiz, checkAnswer } = require("./quiz"); // quiz.js funksiyalari

// Bot API kaliti
const bot = new Bot(process.env.BOT_API_KEY);

// Session konfiguratsiyasi
bot.use(
  session({
    initial: () => ({
      correctAnswers: 0,
      hasStartedQuiz: false,
      currentTest: null,
      subCategory: null,
      askedQuestions: [],
      currentQuestion: null,
      questionCount: 0,
    }),
  })
);

// Boshlang'ich menyu klaviaturasi
function getStartKeyboard() {
  return new Keyboard()
    .text("🦺 Mehnat muhofazasi")
    .text("🏗 Sanoat xavfsizligi")
    .row()
    .text("📣 Reyting")
    .oneTime()
    .resized();
}

// Mehnat muhofazasi menyusi
function getMehnatMuhofazasiKeyboard() {
  return new Keyboard()
    .text("👷 Mehnat muhofazasi")
    .text("📜 312-313 yo'riqnomalari")
    .row()
    .text("🔥 Yong'in bo'yicha")
    .text("⚡ Elektr bo'yicha")
    .row()
    .text("🔙 Orqaga")
    .oneTime()
    .resized();
}

// Sanoat xavfsizligi menyusi
function getSanoatXavfsizligiKeyboard() {
  return new Keyboard()
    .text("👨‍🏫 ITR O'rta bo'g'in raxbarlari")
    .text("📌 Yuk iluvchi")
    .row()
    .text("🏙️ Qozonxona")
    .text("🚇 Mashinist")
    .row()
    .text("🔙 Orqaga")
    .oneTime()
    .resized();
}

// /start komandasi
bot.command("start", async (ctx) => {
  await ctx.reply("Assalomu alaykum! Test topshirmoqchi bo'lgan bo'limingizni tanlang:", {
    reply_markup: getStartKeyboard(),
  });
});

// Xabarlarni qayta ishlash
bot.on("message", async (ctx) => {
  const text = ctx.message.text;

  if (ctx.session.currentTest && ctx.session.currentQuestion) {
    await checkAnswer(ctx); // Javobni tekshirish
    return;
  }

  // Menyularni boshqarish
  if (text === "🦺 Mehnat muhofazasi") {
    await ctx.reply("Mehnat muhofazasi bo'limini tanladingiz. Yo'nalish tanlang:", {
      reply_markup: getMehnatMuhofazasiKeyboard(),
    });
  } else if (text === "🏗 Sanoat xavfsizligi") {
    await ctx.reply("Sanoat xavfsizligi bo'limini tanladingiz. Yo'nalish tanlang:", {
      reply_markup: getSanoatXavfsizligiKeyboard(),
    });
  } else if (text === "📣 Reyting") {
    await ctx.reply("Reyting hali ishlab chiqilmoqda.");
  } else if (text === "🔙 Orqaga") {
    await ctx.reply("Assalomu alaykum! Test tanlang:", {
      reply_markup: getStartKeyboard(),
    });
  } else if (
    ["👷 Mehnat muhofazasi", "📜 312-313 yo'riqnomalari", "🔥 Yong'in bo'yicha", "⚡ Elektr bo'yicha"].includes(text)
  ) {
    await startQuiz(ctx, "safety", text); // Mehnat muhofazasi testi boshlash
  } else if (
    ["👨‍🏫 ITR O'rta bo'g'in raxbarlari", "📌 Yuk iluvchi", "🏙️ Qozonxona", "🚇 Mashinist"].includes(text)
  ) {
    await startQuiz(ctx, "industrial", text); // Sanoat xavfsizligi testi boshlash
  } else {
    await ctx.reply("Iltimos, quyidagi menyudan tanlang:", {
      reply_markup: getStartKeyboard(),
    });
  }
});

// Xatolarni ushlash
bot.catch((err) => {
  console.error("Error in bot:", err);
});

// Botni ishga tushirish
(async () => {
  try {
    await initDatabase(); // Ma'lumotlar bazasini tayyorlash
    await loadQuestions(); // Savollarni yuklash
    bot.start(); // Botni ishga tushirish
    console.log("Bot muvaffaqiyatli ishga tushdi!");
  } catch (error) {
    console.error("Botni ishga tushirishda xatolik:", error);
  }
})();
