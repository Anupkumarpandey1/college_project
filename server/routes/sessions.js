const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const Question = require('../models/Question');

// POST /api/sessions/create
router.post('/create', async (req, res) => {
  try {
    const { topic, language } = req.body || {};
    let query = {};
    if (topic && topic !== 'Random') {
      query.pattern = topic;
    }

    const count = await Question.countDocuments(query);
    if (count === 0) {
      return res.status(404).json({ error: 'No questions found for this topic.' });
    }
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    const roomId = uuidv4();

    const boilerplates = {
      javascript: `// Topic: ${question.pattern}\n\nfunction solution() {\n  // Write your code here\n}\n\n// Test your solution\nconsole.log(solution());`,
      python: `# Topic: ${question.pattern}\n\ndef solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    print(solution())`,
      cpp: `// Topic: ${question.pattern}\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
    };

    const newSession = new Session({
      roomId,
      questionId: question._id,
      currentCode: boilerplates[language] || boilerplates['javascript'],
      language: language || 'javascript'
    });

    await newSession.save();

    res.status(201).json({ roomId, message: 'Room created successfully' });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create room session' });
  }
});

// POST /api/sessions/:roomId/next
router.post('/:roomId/next', async (req, res) => {
  try {
    const { topic, language } = req.body || {};
    let query = {};
    if (topic && topic !== 'Random') {
      query.pattern = topic;
    }

    const count = await Question.countDocuments(query);
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    const boilerplates = {
      javascript: `// Topic: ${question.pattern}\n\nfunction solution() {\n  // Write your code here\n}\n\n// Test your solution\nconsole.log(solution());`,
      python: `# Topic: ${question.pattern}\n\ndef solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    print(solution())`,
      cpp: `// Topic: ${question.pattern}\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
    };

    const updatedSession = await Session.findOneAndUpdate(
      { roomId: req.params.roomId },
      { 
        questionId: question._id, 
        currentCode: boilerplates[language] || boilerplates['javascript'],
        language: language || 'javascript'
      },
      { returnDocument: 'after' }
    ).populate('questionId');

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load next question' });
  }
});

// GET /api/sessions/:roomId
router.get('/:roomId', async (req, res) => {
  try {
    const session = await Session.findOne({ roomId: req.params.roomId }).populate('questionId');
    if (!session) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
