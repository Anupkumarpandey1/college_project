const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().select('-testCases');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
