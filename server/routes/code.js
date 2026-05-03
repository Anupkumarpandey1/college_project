const express = require('express');
const router = express.Router();
const axios = require('axios');

// Language ID mapping for Judge0 CE
const JUDGE0_LANG = {
  'javascript': 63,  // Node.js
  'python': 71,       // Python 3
  'cpp': 54           // C++ (GCC 9.2.0)
};

// POST /api/code/run (Using Judge0 CE via RapidAPI - Free Tier)
router.post('/run', async (req, res) => {
  const { code, language, stdin } = req.body;

  const languageId = JUDGE0_LANG[language];
  if (!languageId) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    // Step 1: Submit the code for execution
    const submitResponse = await axios.post(
      `https://${process.env.JUDGE0_API_HOST || 'judge029.p.rapidapi.com'}/submissions`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin || '').toString('base64'),
        base64_encoded: true,
        cpu_time_limit: 5,
        memory_limit: 128000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com'
        },
        params: { base64_encoded: 'true', wait: 'false' }
      }
    );

    const token = submitResponse.data.token;

    // Step 2: Poll for result (max 15 attempts, 1.5s interval)
    let result = null;
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const statusResponse = await axios.get(
        `https://${process.env.JUDGE0_API_HOST || 'judge029.p.rapidapi.com'}/submissions/${token}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com'
          },
          params: { base64_encoded: 'true', fields: 'stdout,stderr,status,compile_output,time,memory' }
        }
      );

      const status = statusResponse.data.status;
      // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error states
      if (status && status.id > 2) {
        result = statusResponse.data;
        break;
      }
    }

    if (!result) {
      return res.status(408).json({ error: 'Code execution timed out. Try again.' });
    }

    // Decode base64 outputs
    const decode = (b64) => b64 ? Buffer.from(b64, 'base64').toString('utf-8') : '';

    const stdout = decode(result.stdout);
    const stderr = decode(result.stderr);
    const compileOutput = decode(result.compile_output);
    const statusId = result.status?.id;

    // Status 3 = Accepted (ran successfully)
    // Status 6 = Compilation Error
    // Status 5 = Time Limit Exceeded
    // Status 11 = Runtime Error (NZEC)
    if (statusId === 6) {
      // Compilation error
      return res.json({ stdout: '', stderr: compileOutput || 'Compilation Error', code: 1, signal: null });
    }

    if (statusId !== 3) {
      // Runtime error, TLE, or other failure
      const errorMsg = stderr || compileOutput || `Execution failed (Status: ${result.status?.description || 'Unknown'})`;
      return res.json({ stdout: stdout, stderr: errorMsg, code: 1, signal: null });
    }

    // Success
    res.json({
      stdout: stdout,
      stderr: stderr,
      code: 0,
      signal: null
    });

  } catch (error) {
    console.error('Code execution error:', error.response?.data || error.message);

    // Fallback: provide helpful error message
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'API rate limit exceeded. Please wait a moment and try again.' });
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(500).json({ error: 'Invalid API key. Please check JUDGE0_API_KEY in server .env file.' });
    }

    res.status(500).json({ error: 'Failed to execute code via compilation engine.' });
  }
});

module.exports = router;
