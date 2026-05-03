require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  // ═══════════════════════════════════════════════
  //   SLIDING WINDOW — 5 Problems
  // ═══════════════════════════════════════════════
  {
    title: "The Merchant's Best Week",
    storyContext: "A merchant tracks daily profits. He wants to find the maximum total profit he can earn in any K consecutive days.",
    problemStatement: "Given an array of N integers and an integer K, find the maximum sum of any contiguous subarray of size K. Read N and K, then N integers. Print the maximum sum.",
    pattern: "Sliding Window",
    difficulty: "Easy",
    inputFormat: "N K\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: the maximum sum",
    constraints: "1 <= K <= N <= 10^5, -10^4 <= arr[i] <= 10^4",
    testCases: [
      { input: "5 3\n1 4 2 10 2", output: "16", isPublic: true },
      { input: "6 2\n1 1 1 1 1 1", output: "2", isPublic: true },
      { input: "4 1\n-1 -2 -3 -4", output: "-1", isPublic: true },
      { input: "7 4\n3 -1 2 7 -5 1 4", output: "11", isPublic: false },
      { input: "3 3\n5 5 5", output: "15", isPublic: false },
      { input: "8 3\n-2 -3 4 -1 -2 1 5 -3", output: "4", isPublic: false },
      { input: "5 2\n10 -10 10 -10 10", output: "0", isPublic: false },
      { input: "6 4\n2 1 5 1 3 2", output: "10", isPublic: false },
      { input: "1 1\n42", output: "42", isPublic: false },
      { input: "10 5\n1 2 3 4 5 6 7 8 9 10", output: "40", isPublic: false }
    ]
  },
  {
    title: "The Locksmith's Code",
    storyContext: "A locksmith must find the longest sequence of unique characters on a scroll to decode an ancient lock.",
    problemStatement: "Given a string S, find the length of the longest substring without repeating characters. Read the string from standard input. Print a single integer.",
    pattern: "Sliding Window",
    difficulty: "Medium",
    inputFormat: "S (a single string)",
    outputFormat: "Single integer: length of longest substring without repeating characters",
    constraints: "1 <= |S| <= 10^5, S consists of English letters, digits, and symbols",
    testCases: [
      { input: "abcabcbb", output: "3", isPublic: true },
      { input: "bbbbb", output: "1", isPublic: true },
      { input: "pwwkew", output: "3", isPublic: true },
      { input: "abcdefg", output: "7", isPublic: false },
      { input: "a", output: "1", isPublic: false },
      { input: "aab", output: "2", isPublic: false },
      { input: "dvdf", output: "3", isPublic: false },
      { input: "anviaj", output: "5", isPublic: false },
      { input: "abba", output: "2", isPublic: false },
      { input: "tmmzuxt", output: "5", isPublic: false }
    ]
  },
  {
    title: "The Fruit Basket Challenge",
    storyContext: "A farmer walks along a row of fruit trees. He can carry at most 2 types of fruit in his basket. What is the maximum number of fruits he can pick?",
    problemStatement: "Given an array of integers representing types of fruit on each tree, find the maximum number of fruits you can pick if you can only have at most 2 different types. Read N, then N integers. Print the maximum count.",
    pattern: "Sliding Window",
    difficulty: "Medium",
    inputFormat: "N\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: maximum fruits collected",
    constraints: "1 <= N <= 10^5, 0 <= arr[i] <= N",
    testCases: [
      { input: "4\n1 2 1 2", output: "4", isPublic: true },
      { input: "5\n0 1 2 2 3", output: "3", isPublic: true },
      { input: "3\n1 2 3", output: "2", isPublic: true },
      { input: "6\n3 3 3 1 2 1", output: "3", isPublic: false },
      { input: "1\n0", output: "1", isPublic: false },
      { input: "7\n1 1 1 1 1 1 1", output: "7", isPublic: false },
      { input: "5\n1 2 1 3 4", output: "3", isPublic: false },
      { input: "8\n1 2 1 2 1 2 1 2", output: "8", isPublic: false },
      { input: "6\n0 0 1 1 2 2", output: "4", isPublic: false },
      { input: "4\n5 5 5 5", output: "4", isPublic: false }
    ]
  },
  {
    title: "The Minimum Potion",
    storyContext: "An alchemist has a long formula string. She needs to find the shortest segment that contains all required ingredient symbols.",
    problemStatement: "Given a string S and a string T, find the length of the minimum window in S which contains all characters from T. If no such window exists, print -1. Read S and T on separate lines.",
    pattern: "Sliding Window",
    difficulty: "Hard",
    inputFormat: "S\nT",
    outputFormat: "Single integer: length of minimum window, or -1",
    constraints: "1 <= |S|, |T| <= 10^5",
    testCases: [
      { input: "ADOBECODEBANC\nABC", output: "4", isPublic: true },
      { input: "a\na", output: "1", isPublic: true },
      { input: "a\naa", output: "-1", isPublic: true },
      { input: "aa\naa", output: "2", isPublic: false },
      { input: "bba\nab", output: "2", isPublic: false },
      { input: "abc\ncba", output: "3", isPublic: false },
      { input: "ABCDEFG\nBDF", output: "5", isPublic: false },
      { input: "aaaaaaaaab\nab", output: "2", isPublic: false },
      { input: "cabwefgewcwaefgcf\ncae", output: "3", isPublic: false },
      { input: "xyz\na", output: "-1", isPublic: false }
    ]
  },
  {
    title: "The Signal Tower",
    storyContext: "A signal tower receives binary transmissions. The operator can flip at most K zeros to ones. What is the longest continuous signal of ones achievable?",
    problemStatement: "Given a binary array of N elements (0s and 1s) and integer K, find the maximum number of consecutive 1s if you can flip at most K 0s. Read N and K, then the array. Print the maximum length.",
    pattern: "Sliding Window",
    difficulty: "Medium",
    inputFormat: "N K\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: max consecutive 1s after at most K flips",
    constraints: "1 <= N <= 10^5, 0 <= K <= N",
    testCases: [
      { input: "10 2\n1 1 1 0 0 0 1 1 1 1", output: "6", isPublic: true },
      { input: "7 0\n0 0 1 1 0 0 1", output: "2", isPublic: true },
      { input: "5 5\n0 0 0 0 0", output: "5", isPublic: true },
      { input: "6 1\n1 1 0 1 1 1", output: "6", isPublic: false },
      { input: "1 0\n1", output: "1", isPublic: false },
      { input: "1 0\n0", output: "0", isPublic: false },
      { input: "8 2\n0 1 0 1 0 1 0 1", output: "5", isPublic: false },
      { input: "4 1\n1 1 1 1", output: "4", isPublic: false },
      { input: "10 3\n0 0 0 1 1 0 0 0 1 0", output: "7", isPublic: false },
      { input: "6 2\n1 0 0 0 0 1", output: "4", isPublic: false }
    ]
  },

  // ═══════════════════════════════════════════════
  //   TWO POINTERS — 5 Problems (keep existing + add 4 new)
  // ═══════════════════════════════════════════════
  {
    title: "Tale of Two Pointers",
    storyContext: "Two merchants start at opposite ends of a long road. They want to meet at a point where the sum of their remaining distances equals exactly a Target amount.",
    problemStatement: "Given a sorted array of distinct integers and a target value, return the indices of the two numbers that add up to the target. Write a program that reads N and Target from standard input, then N space separated sorted integers. Print exactly two indices (1-based) separated by a space.",
    pattern: "Two Pointers",
    difficulty: "Easy",
    inputFormat: "N Target\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Two space-separated integers",
    constraints: "2 <= N <= 10^5, -10^9 <= arr[i] <= 10^9",
    testCases: [
      { input: "4 9\n2 7 11 15", output: "1 2", isPublic: true },
      { input: "3 6\n2 3 4", output: "1 3", isPublic: true },
      { input: "5 10\n1 2 5 5 8", output: "3 4", isPublic: true },
      { input: "4 0\n-3 -1 1 3", output: "2 3", isPublic: false },
      { input: "2 20\n10 10", output: "1 2", isPublic: false },
      { input: "5 -5\n-10 -5 0 5 10", output: "1 4", isPublic: false },
      { input: "6 100\n10 20 30 40 50 60", output: "4 6", isPublic: false },
      { input: "3 8\n1 7 9", output: "1 2", isPublic: false },
      { input: "7 14\n1 2 3 4 5 6 9", output: "5 7", isPublic: false },
      { input: "4 -8\n-5 -3 0 1", output: "1 2", isPublic: false }
    ]
  },
  {
    title: "The Water Container",
    storyContext: "Two walls stand along a number line. You must choose two walls that hold the maximum volume of water between them.",
    problemStatement: "Given N non-negative integers representing heights of walls, find two walls that together with the x-axis form a container that holds the most water. Read N, then N integers. Print the maximum area.",
    pattern: "Two Pointers",
    difficulty: "Medium",
    inputFormat: "N\nheight[0] height[1] ... height[N-1]",
    outputFormat: "Single integer: maximum water area",
    constraints: "2 <= N <= 10^5, 0 <= height[i] <= 10^4",
    testCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", output: "49", isPublic: true },
      { input: "2\n1 1", output: "1", isPublic: true },
      { input: "3\n1 2 1", output: "2", isPublic: true },
      { input: "4\n1 2 4 3", output: "4", isPublic: false },
      { input: "5\n5 5 5 5 5", output: "20", isPublic: false },
      { input: "6\n1 1 1 1 1 1", output: "5", isPublic: false },
      { input: "4\n1 8 6 2", output: "6", isPublic: false },
      { input: "3\n10 0 10", output: "20", isPublic: false },
      { input: "5\n0 0 0 0 0", output: "0", isPublic: false },
      { input: "7\n1 3 2 5 25 24 5", output: "24", isPublic: false }
    ]
  },
  {
    title: "The Triplet Hunt",
    storyContext: "Three spies must find positions on a number line such that their coordinate sum equals exactly zero for a secret meeting.",
    problemStatement: "Given an array of N integers, find the count of unique triplets that sum to zero. Read N, then N integers. Print the count of unique triplets.",
    pattern: "Two Pointers",
    difficulty: "Medium",
    inputFormat: "N\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: count of unique triplets summing to 0",
    constraints: "3 <= N <= 3000, -10^5 <= arr[i] <= 10^5",
    testCases: [
      { input: "6\n-1 0 1 2 -1 -4", output: "2", isPublic: true },
      { input: "3\n0 0 0", output: "1", isPublic: true },
      { input: "3\n1 2 3", output: "0", isPublic: true },
      { input: "4\n0 0 0 0", output: "1", isPublic: false },
      { input: "6\n-2 0 1 1 2 -1", output: "3", isPublic: false },
      { input: "5\n-1 -1 0 1 1", output: "1", isPublic: false },
      { input: "4\n1 -1 0 0", output: "1", isPublic: false },
      { input: "7\n-4 -1 -1 0 1 2 3", output: "3", isPublic: false },
      { input: "3\n1 1 -2", output: "1", isPublic: false },
      { input: "5\n5 -5 0 3 -3", output: "2", isPublic: false }
    ]
  },
  {
    title: "The Duplicate Purge",
    storyContext: "A librarian has a sorted catalog with duplicate entries. She must count how many unique books remain after removing duplicates in-place.",
    problemStatement: "Given a sorted array of N integers, remove duplicates in-place and return the count of unique elements. Read N, then N sorted integers. Print the number of unique elements.",
    pattern: "Two Pointers",
    difficulty: "Easy",
    inputFormat: "N\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: count of unique elements",
    constraints: "1 <= N <= 10^5, -10^4 <= arr[i] <= 10^4, array is sorted",
    testCases: [
      { input: "7\n1 1 2 2 3 4 4", output: "4", isPublic: true },
      { input: "5\n0 0 0 0 0", output: "1", isPublic: true },
      { input: "4\n1 2 3 4", output: "4", isPublic: true },
      { input: "1\n5", output: "1", isPublic: false },
      { input: "6\n-3 -3 -1 0 0 2", output: "4", isPublic: false },
      { input: "3\n1 1 1", output: "1", isPublic: false },
      { input: "8\n1 1 2 3 3 3 4 5", output: "5", isPublic: false },
      { input: "2\n1 2", output: "2", isPublic: false },
      { input: "10\n0 0 1 1 2 2 3 3 4 4", output: "5", isPublic: false },
      { input: "3\n-1 0 1", output: "3", isPublic: false }
    ]
  },
  {
    title: "The Rain Catcher",
    storyContext: "After a heavy storm, water collects between buildings of varying heights. Calculate how much rainwater is trapped.",
    problemStatement: "Given N non-negative integers representing an elevation map where width of each bar is 1, compute how much water can be trapped after raining. Read N, then N integers. Print the total trapped water.",
    pattern: "Two Pointers",
    difficulty: "Hard",
    inputFormat: "N\nheight[0] height[1] ... height[N-1]",
    outputFormat: "Single integer: total units of trapped water",
    constraints: "1 <= N <= 10^5, 0 <= height[i] <= 10^4",
    testCases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6", isPublic: true },
      { input: "6\n4 2 0 3 2 5", output: "9", isPublic: true },
      { input: "3\n1 0 1", output: "1", isPublic: true },
      { input: "5\n5 4 3 2 1", output: "0", isPublic: false },
      { input: "5\n1 2 3 4 5", output: "0", isPublic: false },
      { input: "4\n3 0 0 3", output: "6", isPublic: false },
      { input: "1\n5", output: "0", isPublic: false },
      { input: "6\n0 0 0 0 0 0", output: "0", isPublic: false },
      { input: "7\n3 0 2 0 4 0 3", output: "12", isPublic: false },
      { input: "5\n2 0 2 0 2", output: "4", isPublic: false }
    ]
  },

  // ═══════════════════════════════════════════════
  //   BINARY SEARCH — 5 Problems (keep existing + add 4 new)
  // ═══════════════════════════════════════════════
  {
    title: "The Librarian's Secret",
    storyContext: "A librarian needs to find a specific ancient book in a massive sorted catalog. Searching page by page will take forever.",
    problemStatement: "Given an array of integers sorted in ascending order and an integer target, write a function to search target. If target exists, print its 0-based index. Otherwise, print -1. Standard Input: N Target, followed by N integers.",
    pattern: "Binary Search",
    difficulty: "Easy",
    inputFormat: "N Target\narr[0] ... arr[N-1]",
    outputFormat: "Single integer: the index or -1",
    constraints: "1 <= N <= 10^4",
    testCases: [
      { input: "6 9\n-1 0 3 5 9 12", output: "4", isPublic: true },
      { input: "6 2\n-1 0 3 5 9 12", output: "-1", isPublic: true },
      { input: "1 5\n5", output: "0", isPublic: true },
      { input: "3 10\n1 5 8", output: "-1", isPublic: false },
      { input: "2 1\n1 2", output: "0", isPublic: false },
      { input: "2 2\n1 2", output: "1", isPublic: false },
      { input: "5 5\n1 2 3 4 5", output: "4", isPublic: false },
      { input: "5 0\n-5 -2 0 2 5", output: "2", isPublic: false },
      { input: "4 10\n1 2 3 4", output: "-1", isPublic: false },
      { input: "7 7\n1 2 3 4 5 6 7", output: "6", isPublic: false }
    ]
  },
  {
    title: "The Boundary Markers",
    storyContext: "An archaeologist searches for the first and last occurrence of a specific symbol in a sorted inscription.",
    problemStatement: "Given a sorted array of N integers and a target, find the first and last position of target in the array. If target is not found, print -1 -1. Read N Target, then N integers.",
    pattern: "Binary Search",
    difficulty: "Medium",
    inputFormat: "N Target\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Two space-separated integers: first and last position (0-based), or -1 -1",
    constraints: "1 <= N <= 10^5, -10^9 <= arr[i] <= 10^9",
    testCases: [
      { input: "6 8\n5 7 7 8 8 10", output: "3 4", isPublic: true },
      { input: "6 6\n5 7 7 8 8 10", output: "-1 -1", isPublic: true },
      { input: "1 1\n1", output: "0 0", isPublic: true },
      { input: "5 5\n5 5 5 5 5", output: "0 4", isPublic: false },
      { input: "3 2\n1 2 3", output: "1 1", isPublic: false },
      { input: "7 3\n1 2 3 3 3 4 5", output: "2 4", isPublic: false },
      { input: "4 10\n1 2 3 4", output: "-1 -1", isPublic: false },
      { input: "2 1\n1 1", output: "0 1", isPublic: false },
      { input: "8 7\n1 3 5 7 7 7 9 11", output: "3 5", isPublic: false },
      { input: "3 0\n-1 0 1", output: "1 1", isPublic: false }
    ]
  },
  {
    title: "The Rotated Vault",
    storyContext: "A thief encounters a vault with a rotated sorted keypad. He must find the target key position despite the rotation.",
    problemStatement: "Given a sorted array of N distinct integers that has been rotated at some pivot, search for a target value. Print its 0-based index or -1 if not found. Read N Target, then N integers.",
    pattern: "Binary Search",
    difficulty: "Medium",
    inputFormat: "N Target\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: 0-based index or -1",
    constraints: "1 <= N <= 10^4, -10^4 <= arr[i] <= 10^4",
    testCases: [
      { input: "7 0\n4 5 6 7 0 1 2", output: "4", isPublic: true },
      { input: "7 3\n4 5 6 7 0 1 2", output: "-1", isPublic: true },
      { input: "1 1\n1", output: "0", isPublic: true },
      { input: "5 5\n3 4 5 1 2", output: "2", isPublic: false },
      { input: "4 2\n2 3 4 1", output: "0", isPublic: false },
      { input: "3 1\n3 1 2", output: "1", isPublic: false },
      { input: "6 6\n1 2 3 4 5 6", output: "5", isPublic: false },
      { input: "5 10\n5 6 7 8 9", output: "-1", isPublic: false },
      { input: "4 4\n4 1 2 3", output: "0", isPublic: false },
      { input: "2 2\n2 1", output: "0", isPublic: false }
    ]
  },
  {
    title: "The Mountain Peak",
    storyContext: "A hiker traverses a mountain trail. The elevation rises then falls. She needs to find the peak elevation's position.",
    problemStatement: "Given an array of N integers where values increase then decrease (a bitonic array), find the index of the peak element. A peak element is strictly greater than its neighbors. Read N, then N integers. Print the 0-based index of any peak.",
    pattern: "Binary Search",
    difficulty: "Easy",
    inputFormat: "N\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "Single integer: 0-based index of peak element",
    constraints: "1 <= N <= 10^5, -10^9 <= arr[i] <= 10^9, arr[i] != arr[i+1]",
    testCases: [
      { input: "4\n1 2 3 1", output: "2", isPublic: true },
      { input: "5\n1 2 1 3 5", output: "4", isPublic: true },
      { input: "3\n3 2 1", output: "0", isPublic: true },
      { input: "1\n1", output: "0", isPublic: false },
      { input: "2\n1 2", output: "1", isPublic: false },
      { input: "2\n2 1", output: "0", isPublic: false },
      { input: "6\n1 3 5 7 4 2", output: "3", isPublic: false },
      { input: "5\n10 20 15 2 1", output: "1", isPublic: false },
      { input: "7\n1 2 3 4 5 6 1", output: "5", isPublic: false },
      { input: "4\n5 10 8 3", output: "1", isPublic: false }
    ]
  },
  {
    title: "The Square Root Oracle",
    storyContext: "An oracle can only answer yes or no. You must find the integer square root of a number by asking the minimum number of questions.",
    problemStatement: "Given a non-negative integer X, compute the integer square root of X (i.e., the largest integer R such that R*R <= X). Read X. Print R.",
    pattern: "Binary Search",
    difficulty: "Easy",
    inputFormat: "Single integer X",
    outputFormat: "Single integer: floor(sqrt(X))",
    constraints: "0 <= X <= 2 * 10^9",
    testCases: [
      { input: "8", output: "2", isPublic: true },
      { input: "16", output: "4", isPublic: true },
      { input: "0", output: "0", isPublic: true },
      { input: "1", output: "1", isPublic: false },
      { input: "2", output: "1", isPublic: false },
      { input: "3", output: "1", isPublic: false },
      { input: "100", output: "10", isPublic: false },
      { input: "2000000000", output: "44721", isPublic: false },
      { input: "999999", output: "999", isPublic: false },
      { input: "49", output: "7", isPublic: false }
    ]
  },

  // ═══════════════════════════════════════════════
  //   STACK / QUEUE — 5 Problems
  // ═══════════════════════════════════════════════
  {
    title: "The Bracket Guardian",
    storyContext: "A guardian checks if the magical brackets of an ancient spell are properly balanced before casting.",
    problemStatement: "Given a string containing only characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if brackets are closed in the correct order. Read S. Print YES or NO.",
    pattern: "Stack",
    difficulty: "Easy",
    inputFormat: "S (a single string of brackets)",
    outputFormat: "YES or NO",
    constraints: "1 <= |S| <= 10^4",
    testCases: [
      { input: "()", output: "YES", isPublic: true },
      { input: "()[]{}", output: "YES", isPublic: true },
      { input: "(]", output: "NO", isPublic: true },
      { input: "([)]", output: "NO", isPublic: false },
      { input: "{[]}", output: "YES", isPublic: false },
      { input: "(", output: "NO", isPublic: false },
      { input: ")", output: "NO", isPublic: false },
      { input: "((()))", output: "YES", isPublic: false },
      { input: "{[()]}", output: "YES", isPublic: false },
      { input: "{{{{", output: "NO", isPublic: false }
    ]
  },
  {
    title: "The Tower Lookout",
    storyContext: "A series of watchtowers stand in a row. Each tower wants to know which taller tower it can see first when looking to the right.",
    problemStatement: "Given an array of N integers, for each element find the next greater element to its right. If no greater element exists, output -1 for that position. Read N, then N integers. Print N space-separated integers.",
    pattern: "Stack",
    difficulty: "Medium",
    inputFormat: "N\narr[0] arr[1] ... arr[N-1]",
    outputFormat: "N space-separated integers",
    constraints: "1 <= N <= 10^5, 1 <= arr[i] <= 10^9",
    testCases: [
      { input: "4\n4 5 2 25", output: "5 25 25 -1", isPublic: true },
      { input: "4\n13 7 6 12", output: "-1 12 12 -1", isPublic: true },
      { input: "3\n3 2 1", output: "-1 -1 -1", isPublic: true },
      { input: "1\n5", output: "-1", isPublic: false },
      { input: "5\n1 2 3 4 5", output: "2 3 4 5 -1", isPublic: false },
      { input: "5\n5 4 3 2 1", output: "-1 -1 -1 -1 -1", isPublic: false },
      { input: "6\n1 3 2 4 1 5", output: "3 4 4 5 5 -1", isPublic: false },
      { input: "3\n2 2 2", output: "-1 -1 -1", isPublic: false },
      { input: "4\n6 8 0 1", output: "8 -1 1 -1", isPublic: false },
      { input: "2\n1 1000000000", output: "1000000000 -1", isPublic: false }
    ]
  },
  {
    title: "The Reinforced Vault",
    storyContext: "A vault designer needs a special stack that can always report the minimum value stored, even after push and pop operations.",
    problemStatement: "Implement a Min Stack. Process Q operations: 'push X', 'pop', 'getMin'. Read Q, then Q operations. For each 'getMin', print the current minimum. If stack is empty on pop or getMin, print -1.",
    pattern: "Stack",
    difficulty: "Medium",
    inputFormat: "Q\nop1\nop2\n...\nopQ",
    outputFormat: "For each getMin operation, print the minimum on a new line",
    constraints: "1 <= Q <= 10^5, -10^9 <= X <= 10^9",
    testCases: [
      { input: "6\npush 5\npush 3\npush 7\ngetMin\npop\ngetMin", output: "3\n3", isPublic: true },
      { input: "4\npush 1\npush 2\ngetMin\npop", output: "1", isPublic: true },
      { input: "3\ngetMin\npop\npush 10", output: "-1", isPublic: true },
      { input: "5\npush -2\npush 0\npush -3\ngetMin\npop", output: "-3", isPublic: false },
      { input: "7\npush 1\npush 1\npush 1\ngetMin\npop\npop\ngetMin", output: "1\n1", isPublic: false },
      { input: "4\npush 3\npush 2\npush 1\ngetMin", output: "1", isPublic: false },
      { input: "6\npush 10\ngetMin\npop\ngetMin\npush 5\ngetMin", output: "10\n-1\n5", isPublic: false },
      { input: "5\npush 0\npush 0\ngetMin\npop\ngetMin", output: "0\n0", isPublic: false },
      { input: "8\npush 3\npush 1\npush 2\ngetMin\npop\ngetMin\npop\ngetMin", output: "1\n1\n3", isPublic: false },
      { input: "1\ngetMin", output: "-1", isPublic: false }
    ]
  },
  {
    title: "The Stock Analyst",
    storyContext: "A stock analyst needs to find, for each day, how many consecutive days before it had a price less than or equal to today's price.",
    problemStatement: "Given N daily stock prices, find the stock span for each day. The span of a stock on day i is the number of consecutive days just before (and including) day i where the price was <= price[i]. Read N, then N integers. Print N space-separated spans.",
    pattern: "Stack",
    difficulty: "Medium",
    inputFormat: "N\nprice[0] price[1] ... price[N-1]",
    outputFormat: "N space-separated integers",
    constraints: "1 <= N <= 10^5, 1 <= price[i] <= 10^5",
    testCases: [
      { input: "7\n100 80 60 70 60 75 85", output: "1 1 1 2 1 4 6", isPublic: true },
      { input: "6\n10 4 5 90 120 80", output: "1 1 2 4 5 1", isPublic: true },
      { input: "3\n1 2 3", output: "1 2 3", isPublic: true },
      { input: "3\n3 2 1", output: "1 1 1", isPublic: false },
      { input: "1\n50", output: "1", isPublic: false },
      { input: "5\n5 5 5 5 5", output: "1 2 3 4 5", isPublic: false },
      { input: "4\n1 3 2 4", output: "1 2 1 4", isPublic: false },
      { input: "5\n100 90 80 90 100", output: "1 1 1 3 5", isPublic: false },
      { input: "6\n31 27 14 21 30 41", output: "1 1 1 2 4 6", isPublic: false },
      { input: "4\n10 20 30 40", output: "1 2 3 4", isPublic: false }
    ]
  },
  {
    title: "The Postfix Machine",
    storyContext: "An ancient computing machine only understands postfix (Reverse Polish) notation. You must evaluate expressions on it.",
    problemStatement: "Evaluate a postfix expression. Read N tokens, where each token is either an integer or an operator (+, -, *). Print the result. Read N, then N tokens space-separated.",
    pattern: "Stack",
    difficulty: "Easy",
    inputFormat: "N\ntoken1 token2 ... tokenN",
    outputFormat: "Single integer: result of postfix evaluation",
    constraints: "1 <= N <= 10^4, operands fit in 32-bit integer",
    testCases: [
      { input: "5\n2 3 + 4 *", output: "20", isPublic: true },
      { input: "5\n5 1 2 + 4 * + 3 -", output: "14", isPublic: true },
      { input: "3\n3 4 +", output: "7", isPublic: true },
      { input: "1\n42", output: "42", isPublic: false },
      { input: "3\n10 5 -", output: "5", isPublic: false },
      { input: "3\n6 3 *", output: "18", isPublic: false },
      { input: "7\n2 3 + 5 * 6 -", output: "19", isPublic: false },
      { input: "5\n4 2 - 3 *", output: "6", isPublic: false },
      { input: "5\n1 2 + 3 +", output: "6", isPublic: false },
      { input: "7\n10 2 * 3 + 4 -", output: "19", isPublic: false }
    ]
  },

  // ═══════════════════════════════════════════════
  //   GRAPH DFS / Trees — 5 Problems
  // ═══════════════════════════════════════════════
  {
    title: "The Island Counter",
    storyContext: "A cartographer has a grid map of land ('1') and water ('0'). She needs to count how many distinct islands exist.",
    problemStatement: "Given an M x N grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically. Read M and N, then M rows of N characters (0 or 1). Print the number of islands.",
    pattern: "Graph DFS",
    difficulty: "Medium",
    inputFormat: "M N\nrow1\nrow2\n...\nrowM",
    outputFormat: "Single integer: number of islands",
    constraints: "1 <= M, N <= 300",
    testCases: [
      { input: "4 5\n11110\n11010\n11000\n00000", output: "1", isPublic: true },
      { input: "4 5\n11000\n11000\n00100\n00011", output: "3", isPublic: true },
      { input: "1 1\n1", output: "1", isPublic: true },
      { input: "1 1\n0", output: "0", isPublic: false },
      { input: "3 3\n101\n010\n101", output: "5", isPublic: false },
      { input: "3 3\n111\n111\n111", output: "1", isPublic: false },
      { input: "2 2\n10\n01", output: "2", isPublic: false },
      { input: "1 5\n10101", output: "3", isPublic: false },
      { input: "3 3\n000\n000\n000", output: "0", isPublic: false },
      { input: "4 4\n1010\n0101\n1010\n0101", output: "8", isPublic: false }
    ]
  },
  {
    title: "The Cycle Detective",
    storyContext: "A detective must determine if a network of connections forms any circular dependency — a cycle in the graph.",
    problemStatement: "Given an undirected graph with N nodes (1 to N) and M edges, determine if the graph contains a cycle. Read N M, then M edges (u v). Print YES if cycle exists, NO otherwise.",
    pattern: "Graph DFS",
    difficulty: "Medium",
    inputFormat: "N M\nu1 v1\nu2 v2\n...\nuM vM",
    outputFormat: "YES or NO",
    constraints: "1 <= N <= 10^4, 0 <= M <= 10^5",
    testCases: [
      { input: "4 4\n1 2\n2 3\n3 4\n4 1", output: "YES", isPublic: true },
      { input: "3 2\n1 2\n2 3", output: "NO", isPublic: true },
      { input: "4 5\n1 2\n1 3\n2 3\n3 4\n4 1", output: "YES", isPublic: true },
      { input: "1 0", output: "NO", isPublic: false },
      { input: "2 1\n1 2", output: "NO", isPublic: false },
      { input: "5 4\n1 2\n2 3\n3 4\n4 5", output: "NO", isPublic: false },
      { input: "5 5\n1 2\n2 3\n3 4\n4 5\n5 1", output: "YES", isPublic: false },
      { input: "3 3\n1 2\n2 3\n1 3", output: "YES", isPublic: false },
      { input: "6 5\n1 2\n3 4\n5 6\n2 3\n4 5", output: "NO", isPublic: false },
      { input: "4 3\n1 2\n2 3\n1 3", output: "YES", isPublic: false }
    ]
  },
  {
    title: "The Network Clusters",
    storyContext: "A network administrator needs to find how many separate clusters of connected servers exist in the data center.",
    problemStatement: "Given an undirected graph with N nodes (1 to N) and M edges, find the number of connected components. Read N M, then M edges. Print the count of connected components.",
    pattern: "Graph DFS",
    difficulty: "Easy",
    inputFormat: "N M\nu1 v1\nu2 v2\n...\nuM vM",
    outputFormat: "Single integer: number of connected components",
    constraints: "1 <= N <= 10^5, 0 <= M <= 10^5",
    testCases: [
      { input: "5 3\n1 2\n2 3\n4 5", output: "2", isPublic: true },
      { input: "4 0", output: "4", isPublic: true },
      { input: "3 3\n1 2\n2 3\n1 3", output: "1", isPublic: true },
      { input: "1 0", output: "1", isPublic: false },
      { input: "6 3\n1 2\n3 4\n5 6", output: "3", isPublic: false },
      { input: "5 4\n1 2\n2 3\n3 4\n4 5", output: "1", isPublic: false },
      { input: "7 2\n1 3\n5 7", output: "5", isPublic: false },
      { input: "4 6\n1 2\n1 3\n1 4\n2 3\n2 4\n3 4", output: "1", isPublic: false },
      { input: "10 0", output: "10", isPublic: false },
      { input: "2 1\n1 2", output: "1", isPublic: false }
    ]
  },
  {
    title: "The Tree Depth",
    storyContext: "An arborist measures the depth of a binary tree. She must find the maximum depth from root to the deepest leaf.",
    problemStatement: "Given a binary tree represented by N nodes, find its maximum depth. Input: N (number of nodes), then N lines: each line has value, leftChildIndex, rightChildIndex (-1 for null). Root is node 0. Print the max depth.",
    pattern: "Graph DFS",
    difficulty: "Easy",
    inputFormat: "N\nval0 left0 right0\nval1 left1 right1\n...\nvalN-1 leftN-1 rightN-1",
    outputFormat: "Single integer: maximum depth of tree",
    constraints: "0 <= N <= 10^4, -1 means null child",
    testCases: [
      { input: "5\n3 1 2\n9 -1 -1\n20 3 4\n15 -1 -1\n7 -1 -1", output: "3", isPublic: true },
      { input: "1\n1 -1 -1", output: "1", isPublic: true },
      { input: "0", output: "0", isPublic: true },
      { input: "2\n1 1 -1\n2 -1 -1", output: "2", isPublic: false },
      { input: "3\n1 1 2\n2 -1 -1\n3 -1 -1", output: "2", isPublic: false },
      { input: "4\n1 1 -1\n2 2 -1\n3 3 -1\n4 -1 -1", output: "4", isPublic: false },
      { input: "7\n1 1 2\n2 3 4\n3 5 6\n4 -1 -1\n5 -1 -1\n6 -1 -1\n7 -1 -1", output: "3", isPublic: false },
      { input: "3\n1 -1 1\n2 -1 2\n3 -1 -1", output: "3", isPublic: false },
      { input: "6\n10 1 2\n5 3 -1\n15 -1 4\n3 -1 -1\n18 5 -1\n17 -1 -1", output: "4", isPublic: false },
      { input: "2\n1 -1 1\n2 -1 -1", output: "2", isPublic: false }
    ]
  },
  {
    title: "The Path Sum Quest",
    storyContext: "A knight traverses a binary tree of enchanted nodes. He must find if any root-to-leaf path sums to the target magic number.",
    problemStatement: "Given a binary tree (same format as Tree Depth) and a target sum S, determine if there exists a root-to-leaf path where the sum of node values equals S. Print YES or NO. Read N S, then N node descriptions.",
    pattern: "Graph DFS",
    difficulty: "Easy",
    inputFormat: "N S\nval0 left0 right0\n...\nvalN-1 leftN-1 rightN-1",
    outputFormat: "YES or NO",
    constraints: "1 <= N <= 5000, -1000 <= val[i] <= 1000, -10^6 <= S <= 10^6",
    testCases: [
      { input: "5 22\n5 1 2\n4 3 -1\n8 -1 4\n11 -1 -1\n4 -1 -1", output: "YES", isPublic: true },
      { input: "3 5\n1 1 2\n2 -1 -1\n3 -1 -1", output: "NO", isPublic: true },
      { input: "1 1\n1 -1 -1", output: "YES", isPublic: true },
      { input: "1 5\n1 -1 -1", output: "NO", isPublic: false },
      { input: "3 3\n1 1 2\n2 -1 -1\n3 -1 -1", output: "YES", isPublic: false },
      { input: "3 4\n1 1 2\n2 -1 -1\n3 -1 -1", output: "YES", isPublic: false },
      { input: "5 8\n5 1 2\n4 -1 -1\n8 3 4\n13 -1 -1\n4 -1 -1", output: "NO", isPublic: false },
      { input: "4 10\n1 1 -1\n2 2 -1\n3 3 -1\n4 -1 -1", output: "YES", isPublic: false },
      { input: "2 3\n1 1 -1\n2 -1 -1", output: "YES", isPublic: false },
      { input: "3 100\n50 1 2\n25 -1 -1\n50 -1 -1", output: "YES", isPublic: false }
    ]
  },

  // ═══════════════════════════════════════════════
  //   DYNAMIC PROGRAMMING — 5 Problems (keep existing + add 4 new)
  // ═══════════════════════════════════════════════
  {
    title: "The Fibonacci Vault",
    storyContext: "A thief needs to guess the combination of a vault, which always equals the Nth number in the Fibonacci sequence.",
    problemStatement: "Read N from standard input. Find and print the Nth Fibonacci number (where Fib(0)=0, Fib(1)=1).",
    pattern: "Dynamic Programming",
    difficulty: "Easy",
    inputFormat: "Single integer N",
    outputFormat: "The Nth Fibonacci number",
    constraints: "0 <= N <= 30",
    testCases: [
      { input: "2", output: "1", isPublic: true },
      { input: "4", output: "3", isPublic: true },
      { input: "10", output: "55", isPublic: true },
      { input: "0", output: "0", isPublic: false },
      { input: "1", output: "1", isPublic: false },
      { input: "5", output: "5", isPublic: false },
      { input: "6", output: "8", isPublic: false },
      { input: "7", output: "13", isPublic: false },
      { input: "15", output: "610", isPublic: false },
      { input: "20", output: "6765", isPublic: false }
    ]
  },
  {
    title: "The Staircase Puzzle",
    storyContext: "A wizard climbs a magical staircase of N steps. He can take 1 or 2 steps at a time. How many distinct ways can he reach the top?",
    problemStatement: "Given N (number of steps), find the number of distinct ways to climb to the top, taking 1 or 2 steps at a time. Read N. Print the answer.",
    pattern: "Dynamic Programming",
    difficulty: "Easy",
    inputFormat: "Single integer N",
    outputFormat: "Single integer: number of ways",
    constraints: "1 <= N <= 45",
    testCases: [
      { input: "2", output: "2", isPublic: true },
      { input: "3", output: "3", isPublic: true },
      { input: "5", output: "8", isPublic: true },
      { input: "1", output: "1", isPublic: false },
      { input: "4", output: "5", isPublic: false },
      { input: "6", output: "13", isPublic: false },
      { input: "10", output: "89", isPublic: false },
      { input: "15", output: "987", isPublic: false },
      { input: "20", output: "10946", isPublic: false },
      { input: "30", output: "1346269", isPublic: false }
    ]
  },
  {
    title: "The Coin Change Bureau",
    storyContext: "A currency exchange bureau must make change for a given amount using the fewest coins from available denominations.",
    problemStatement: "Given N coin denominations and an amount M, find the minimum number of coins needed to make the amount. If it's impossible, print -1. Read N M, then N denominations.",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    inputFormat: "N M\ncoin[0] coin[1] ... coin[N-1]",
    outputFormat: "Single integer: minimum coins or -1",
    constraints: "1 <= N <= 12, 1 <= M <= 10^4, 1 <= coin[i] <= 2^31-1",
    testCases: [
      { input: "3 11\n1 5 6", output: "3", isPublic: true },
      { input: "1 3\n2", output: "-1", isPublic: true },
      { input: "1 0\n1", output: "0", isPublic: true },
      { input: "3 6\n1 2 5", output: "2", isPublic: false },
      { input: "3 11\n1 5 2", output: "3", isPublic: false },
      { input: "2 3\n1 2", output: "2", isPublic: false },
      { input: "3 100\n1 5 10", output: "10", isPublic: false },
      { input: "4 7\n2 3 5 7", output: "1", isPublic: false },
      { input: "3 15\n1 5 10", output: "2", isPublic: false },
      { input: "2 6\n3 5", output: "2", isPublic: false }
    ]
  },
  {
    title: "The Jewel Thief",
    storyContext: "A thief robs houses along a street. He cannot rob two adjacent houses because of alarm systems. What is the maximum loot?",
    problemStatement: "Given an array of N non-negative integers representing money at each house, find the maximum sum you can rob without robbing two adjacent houses. Read N, then N integers. Print the maximum sum.",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    inputFormat: "N\nnums[0] nums[1] ... nums[N-1]",
    outputFormat: "Single integer: maximum robbery amount",
    constraints: "1 <= N <= 100, 0 <= nums[i] <= 400",
    testCases: [
      { input: "4\n1 2 3 1", output: "4", isPublic: true },
      { input: "5\n2 7 9 3 1", output: "12", isPublic: true },
      { input: "1\n5", output: "5", isPublic: true },
      { input: "2\n1 2", output: "2", isPublic: false },
      { input: "3\n2 1 4", output: "6", isPublic: false },
      { input: "6\n6 7 1 30 8 2", output: "39", isPublic: false },
      { input: "4\n0 0 0 0", output: "0", isPublic: false },
      { input: "5\n100 1 100 1 100", output: "300", isPublic: false },
      { input: "3\n1 1 1", output: "2", isPublic: false },
      { input: "7\n1 2 3 4 5 6 7", output: "16", isPublic: false }
    ]
  },
  {
    title: "The Sequence Match",
    storyContext: "Two ancient scrolls contain different texts. A scholar wants to find the longest sequence of characters that appears (in order) in both scrolls.",
    problemStatement: "Given two strings A and B, find the length of their Longest Common Subsequence (LCS). Read A and B on separate lines. Print the length.",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    inputFormat: "A\nB",
    outputFormat: "Single integer: length of LCS",
    constraints: "1 <= |A|, |B| <= 1000",
    testCases: [
      { input: "abcde\nace", output: "3", isPublic: true },
      { input: "abc\nabc", output: "3", isPublic: true },
      { input: "abc\ndef", output: "0", isPublic: true },
      { input: "a\na", output: "1", isPublic: false },
      { input: "abcd\nabcd", output: "4", isPublic: false },
      { input: "abcdef\nfbdamn", output: "2", isPublic: false },
      { input: "AGGTAB\nGXTXAYB", output: "4", isPublic: false },
      { input: "abab\nbaba", output: "3", isPublic: false },
      { input: "xyz\nabc", output: "0", isPublic: false },
      { input: "aaa\naa", output: "2", isPublic: false }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log(`Successfully inserted ${questions.length} questions into the database!`);
    console.log('Topics covered:');
    const patterns = [...new Set(questions.map(q => q.pattern))];
    patterns.forEach(p => {
      const count = questions.filter(q => q.pattern === p).length;
      console.log(`  ${p}: ${count} problems`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedDB();
