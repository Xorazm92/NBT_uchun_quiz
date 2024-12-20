const { MongoClient } = require("mongodb");
require("dotenv").config();

let db;

async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME);
    console.log("Connected to MongoDB");

    const leaderboardCollection = db.collection("leaderboard");
    
    // Avval mavjud indekslarni o'chiramiz
    await leaderboardCollection.dropIndexes();
    
    // Keyin yangi indeks yaratamiz
    await leaderboardCollection.createIndex({ username: 1 }, { unique: true });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

async function updateLeaderboard(username, score) {
  if (!username) {
    console.log("Username is missing, skipping leaderboard update");
    return;
  }

  const now = new Date().toISOString();
  const leaderboardCollection = db.collection("leaderboard");

  try {
    // upsert: true - agar yozuv bo'lmasa yangi yozuv yaratadi, bo'lsa yangilaydi
    await leaderboardCollection.updateOne(
      { username }, // qidiruv sharti
      { 
        $set: { 
          last_played: now,
          // Agar mavjud score katta bo'lsa, yangi score bilan yangilanmaydi
          score: await leaderboardCollection.findOne({ username })
            .then(doc => doc && doc.score > score ? doc.score : score)
        }
      },
      { upsert: true } // muhim parametr
    );
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    throw error;
  }
}
module.exports = { initDatabase, updateLeaderboard };
