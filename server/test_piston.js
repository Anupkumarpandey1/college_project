const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'c++',
      version: '10.2.0',
      files: [{ content: '#include <iostream>\nusing namespace std;\nint main() { cout << "test"; return 0; }' }]
    });
    console.log("SUCCESS:", JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("ERROR DATA:", err.response.data);
    } else {
      console.error("ERROR:", err.message);
    }
  }
}
test();
