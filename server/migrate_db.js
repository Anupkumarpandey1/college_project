const mongoose = require('mongoose');

const uri = "mongodb+srv://concept:Vy5Fcsm7Yg7c1vDi@cluster0.o854obv.mongodb.net/algoriddle?appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    const db = mongoose.connection.db;

    const questions = await db.collection('questions').find({}).toArray();

    for (let q of questions) {
      const allCases = q.testCases || [];
      if (allCases.length <= 2 && allCases[0].input.includes("\n")) {
         console.log(`Question ${q.title} already looks migrated.`);
         continue;
      }

      const publicCases = allCases.filter(tc => tc.isPublic !== false);
      const hiddenCases = allCases.filter(tc => tc.isPublic === false);

      const newTestCases = [];

      if (publicCases.length > 0) {
        newTestCases.push({
          input: `${publicCases.length}\n${publicCases.map(tc => tc.input).join('\n')}`,
          output: publicCases.map(tc => tc.output).join('\n'),
          isPublic: true
        });
      }

      if (hiddenCases.length > 0) {
        newTestCases.push({
          input: `${hiddenCases.length}\n${hiddenCases.map(tc => tc.input).join('\n')}`,
          output: hiddenCases.map(tc => tc.output).join('\n'),
          isPublic: false
        });
      }

      // Prepend an explanation in inputFormat regarding T testcases
      let newFormat = q.inputFormat;
      if (!newFormat.includes("First line contains T")) {
          newFormat = `First line contains T (number of test cases).\nFor each test case:\n${q.inputFormat}`;
      }

      await db.collection('questions').updateOne(
        { _id: q._id },
        { 
          $set: { 
            testCases: newTestCases,
            inputFormat: newFormat
          } 
        }
      );
      console.log(`Migrated question: ${q.title} into ${newTestCases.length} batched testcases.`);
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
