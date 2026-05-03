const axios = require('axios');

async function testWandbox() {
  const code = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) {
        cout << "Failed to read n" << endl;
        return 0;
    }
    
    vector<pair<int, int>> intervals(n);
    for(int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }
    
    if(n == 0) return 0;
    
    sort(intervals.begin(), intervals.end());
    vector<pair<int, int>> merged;
    merged.push_back(intervals[0]);
    
    for(int i = 1; i < n; i++) {
        if(intervals[i].first <= merged.back().second) {
            merged.back().second = max(merged.back().second, intervals[i].second);
        } else {
            merged.push_back(intervals[i]);
        }
    }
    
    for(auto p : merged) {
        cout << p.first << " " << p.second << endl;
    }
    
    return 0;
}
  `;

  const stdin = '4\n1 3\n2 6\n8 10\n15 18';

  try {
    const response = await axios.post('https://wandbox.org/api/compile.json', {
      compiler: 'gcc-head',
      code: code,
      stdin: stdin,
      save: false
    });

    console.log("Wandbox Response:", response.data);
  } catch(err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

testWandbox();
