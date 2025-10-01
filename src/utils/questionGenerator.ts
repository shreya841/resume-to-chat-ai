export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  startTime: number;
  answer?: string;
  score?: number;
  isCoding?: boolean;
}

const QUESTION_POOLS = {
  easy: [
    "What is the difference between let, const, and var in JavaScript? Explain with examples.",
    "Explain the concept of React hooks. What are the benefits of using hooks over class components?",
    "What is the difference between == and === in JavaScript? Provide examples.",
    "Explain what is a closure in JavaScript with a simple example.",
    "What is the virtual DOM in React and why is it beneficial?",
    "What are the different data types in JavaScript? Explain each with examples.",
    "Explain the concept of hoisting in JavaScript.",
    "What is the difference between function declaration and function expression?",
    "What are React components and what are the different types?",
    "Explain the concept of props in React with examples.",
    "Explain the difference between shallow copy and reference copy in JavaScript objects.",
    "What is the purpose of the key prop in React lists?",

"What is the difference between for...of and for...in loops in JavaScript?"
  ],
  medium: [
    "What is REST API? Explain the principles of RESTful architecture and give examples of HTTP methods.",
    "Explain the concept of promises in JavaScript. How do they help with asynchronous programming?",
    "What is the difference between controlled and uncontrolled components in React?",
    "Explain the concept of event delegation in JavaScript with examples.",
    "What is the difference between map(), filter(), and reduce() in JavaScript? Provide examples.",
    "Explain the React component lifecycle methods and their use cases.",
    "What is the difference between null and undefined in JavaScript?",
    "Explain the concept of prototypal inheritance in JavaScript.",
    "What are React keys and why are they important when rendering lists?",
    "Explain the concept of debouncing and throttling in JavaScript."
  ],
  hard: [
    "Explain the concept of closures in JavaScript. Provide a practical example of where you would use closures in a real application and explain why they are useful.",
    "What is the difference between call(), apply(), and bind() methods in JavaScript? Provide examples of when you would use each.",
    "Explain how JavaScript's event loop works. What are the differences between the call stack, callback queue, and microtask queue?",
    "What are higher-order components (HOCs) in React? Provide an example and explain when you would use them.",
    "Explain the concept of currying in JavaScript with practical examples.",
    "What is the difference between shallow copy and deep copy in JavaScript? How would you implement a deep copy function?",
    "Explain React's reconciliation algorithm and how it optimizes rendering performance.",
    "What are JavaScript generators and iterators? Provide examples of their usage.",
    "Explain the concept of memoization and how it can be implemented in JavaScript.",
    "What is the difference between synchronous and asynchronous JavaScript? Explain with examples of callbacks, promises, and async/await.",
    "What are design patterns commonly used in JavaScript/React applications?"
  ],
  coding: [
    "Write a function that finds the maximum number in an array without using built-in methods like Math.max(). Handle edge cases like empty arrays.",
    "Implement a function that reverses a string without using built-in reverse methods. Consider Unicode characters and edge cases.",
    "Write a function that checks if a given string is a palindrome (reads the same forwards and backwards). Make it case-insensitive.",
    "Implement a function that removes duplicate elements from an array while maintaining the original order of first occurrences.",
    "Write a function that finds the factorial of a number using both recursive and iterative approaches. Handle edge cases.",
    "Implement a function that checks if two strings are anagrams of each other (contain the same characters in different order).",
    "Write a function that finds the first non-repeating character in a string. Return null if all characters repeat.",
    "Implement a function that merges two sorted arrays into one sorted array without using built-in sort methods.",
    "Write a function that generates the Fibonacci sequence up to n numbers. Implement both recursive and iterative solutions.",
    "Implement a function that counts the frequency of each character in a string and returns an object with the results."
  ]
};

export const generateRandomQuestions = (): InterviewQuestion[] => {
  const questions: InterviewQuestion[] = [];
  
  // Demo question (always first)
  const demoQuestion: InterviewQuestion = {
    id: "demo",
    question: "This is a demo question to get you familiar with the interface. Can you tell me your favorite programming language and why? (This won't affect your final score)",
    difficulty: "Easy",
    timeLimit: 60,
    startTime: Date.now(),
  };
  questions.push(demoQuestion);

  // Get random questions from each pool (removed coding questions)
  const easyQuestions = getRandomFromPool(QUESTION_POOLS.easy, 2);
  const mediumQuestions = getRandomFromPool(QUESTION_POOLS.medium, 2);
  const hardQuestions = getRandomFromPool(QUESTION_POOLS.hard, 2);

  // Add easy questions
  easyQuestions.forEach((q, index) => {
    questions.push({
      id: `easy-${index + 1}`,
      question: q,
      difficulty: "Easy",
      timeLimit: 90,
      startTime: Date.now(),
    });
  });

  // Add medium questions
  mediumQuestions.forEach((q, index) => {
    questions.push({
      id: `medium-${index + 1}`,
      question: q,
      difficulty: "Medium",
      timeLimit: 120,
      startTime: Date.now(),
    });
  });

  // Add hard questions
  hardQuestions.forEach((q, index) => {
    questions.push({
      id: `hard-${index + 1}`,
      question: q,
      difficulty: "Hard",
      timeLimit: 150,
      startTime: Date.now(),
    });
  });

  return questions;
};

const getRandomFromPool = (pool: string[], count: number): string[] => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const isDemoQuestion = (questionId: string): boolean => {
  return questionId === "demo";
};