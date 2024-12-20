const { Keyboard } = require("grammy");
const { getRandomQuestion } = require("./questions");
const { updateLeaderboard } = require("./database");

async function startQuiz(ctx, category, subCategory) {
  ctx.session.currentTest = category;
  ctx.session.subCategory = subCategory;
  ctx.session.askedQuestions = [];
  ctx.session.correctAnswers = 0;
  ctx.session.questionCount = 0;
  await sendNextQuestion(ctx, category, subCategory);
}

async function sendNextQuestion(ctx, category, subCategory) {
  const asked = ctx.session.askedQuestions || [];
  const maxQuestions = 10;
  const questionNumber = ctx.session.questionCount + 1;

  if (ctx.session.questionCount >= maxQuestions) {
    const finalKeyboard = new Keyboard()
      .text("🔄 Testni qayta boshlash")
      .row()
      .text("🏠 Bosh menyu")
      .resized();

    await ctx.reply(
      `✅ *Test tugadi!* \n\n 🎯 To'g'ri javoblaringiz soni: *${ctx.session.correctAnswers}/${maxQuestions}.*`,
      { reply_markup: finalKeyboard, parse_mode: "Markdown" }
    );
    ctx.session.currentTest = null;
    return;
  }

  const question = getRandomQuestion(category, subCategory, asked);
  if (!question) {
    const finalKeyboard = new Keyboard()
      .text("🔄 Testni qayta boshlash")
      .row()
      .text("🏠 Bosh menyu")
      .resized();

    await ctx.reply("Savollar tugadi! 🔄 Testni yana boshlash uchun quyidagi tugmalardan foydalaning.", {
      reply_markup: finalKeyboard,
      parse_mode: "Markdown",
    });
    ctx.session.currentTest = null;
    return;
  }

  asked.push(question.id);
  ctx.session.askedQuestions = asked;
  ctx.session.currentQuestion = question;
  ctx.session.questionCount++;

  const keyboard = new Keyboard();
const options = ["a)", "b)", "c)", "d)"]; 

question.options.forEach((option, index) => 
  keyboard.text(`${options[index]} ${option}`).row()
);

await ctx.reply(
  `🟢 *${questionNumber}-savol:* \n${question.question}`,
  { reply_markup: keyboard, parse_mode: "Markdown" }
);
}

async function checkAnswer(ctx) {
  const question = ctx.session.currentQuestion;
  if (!question) {
    await ctx.reply("Savol topilmadi. Iltimos, /start ni bosing.", {
      parse_mode: "Markdown",
    });
    return;
  }

 
  const userAnswer = ctx.message.text.trim().split(' ')[0]; 

 
  const correctAnswerIndex = question.correctOption; 
  const correctAnswerLetter = ["a)", "b)", "c)", "d)"][correctAnswerIndex]; 

  
  console.log("Foydalanuvchi javobi:", userAnswer);
  console.log("To'g'ri javob:", correctAnswerLetter);

  
  if (userAnswer === correctAnswerLetter) {
    ctx.session.correctAnswers++; 
    await ctx.reply("✅ To'g'ri javob!", { parse_mode: "Markdown" });
  } else {
    await ctx.reply(
      `❌ Noto'g'ri! To'g'ri javob: ${correctAnswerLetter} ${question.options[correctAnswerIndex]}`,
      { parse_mode: "Markdown" }
    );
  }

  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  const score = ctx.session.correctAnswers;
  
  await updateLeaderboard(userId, username, score);
  
 
  await sendNextQuestion(ctx, ctx.session.currentTest, ctx.session.subCategory);
}



module.exports = { startQuiz, checkAnswer };
