const fs = require("fs").promises;

let questionsData = {};

async function loadQuestions() {
  console.log("Savollarni yuklash boshlandi...");
  const categories = {
    safety: {
      "👷 Mehnat muhofazasi": ["safety_mehnat.json"],
      "📜 312-313 yo'riqnomalari": ["safety_312_313.json"],
      "🔥 Yong'in bo'yicha": ["safety_yongin.json"],
      "⚡ Elektr bo'yicha": ["safety_elektr.json"],
    },
    industrial: {
      "👨‍🏫 ITR O'rta bo'g'in raxbarlari": ["industrial_itr.json"],
      "📌 Yuk iluvchi": ["industrial_yuk_iluvchi.json"],
      "🏙️ Qozonxona": ["industrial_qozon.json"],
      "🚇 Mashinist": ["industrial_mashinst.json"],
    },
  };

  for (const [category, subCategories] of Object.entries(categories)) {
    questionsData[category] = {};
    for (const [subCategory, files] of Object.entries(subCategories)) {
      questionsData[category][subCategory] = [];
      for (const file of files) {
        try {
          const data = await fs.readFile(`./questions/${file}`, "utf8");
          const parsedData = JSON.parse(data);
          if (Array.isArray(parsedData.questions)) {
            questionsData[category][subCategory].push(...parsedData.questions);
          } else {
            console.warn(`Warning: No valid questions array in file: ${file}`);
          }
        } catch (error) {
          console.error(`Failed to load questions from ${file}:`, error);
        }
      }
    }
  }
  console.log("Savollar muvaffaqiyatli yuklandi!");
}

function getRandomQuestion(category, subCategory, asked = []) {
  const availableQuestions =
    questionsData[category][subCategory]?.filter((_, idx) => !asked.includes(idx)) || [];
  if (availableQuestions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const question = availableQuestions[randomIndex];


  if (!question.options || question.options.length === 0) {
    console.warn("Warning: Question has no valid options array:", question);
    return null; 
  }

 
  question.answers = shuffleArray([...question.options]);

  return question;
}

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  return array;
}


module.exports = { loadQuestions, getRandomQuestion };
