
# AI-Powered Interview Assistant (Crisp)

A React app that works as an AI-powered interview assistant with chat for candidates and a dashboard for interviewers. The system allows candidates to upload their resume, collect missing information, conduct a timed AI-generated interview, and automatically score and summarize the candidate. Interviewers can view candidates’ progress, chat history, and final scores.

---

## Features

- Two tabs: **Interviewee (Chat)** and **Interviewer (Dashboard)**
- Resume upload (PDF/DOCX) with automatic extraction of **Name, Email, Phone**
- Missing information collection by chatbot before starting the interview
- Timed interview with AI-generated questions (6 questions: 2 Easy, 2 Medium, 2 Hard)
- Automatic scoring and short summary after interview completion
- Local data persistence (candidates can resume unfinished sessions)
- “Welcome Back” modal for unfinished sessions
- Clean and responsive UI built with shadcn-ui + Tailwind CSS



 Tech Stack

- **Frontend:** React + TypeScript  
- **Bundler:** Vite  
- **UI Library:** shadcn-ui + Tailwind CSS  
- **State Management & Persistence:** Redux / LocalStorage  
- **Development:** Node.js & npm

```
resume-to-chat-ai/
├── src/
│ ├── components/ # Chat, dashboard, UI components
│ ├── pages/ # IntervieweeTab, InterviewerTab
│ ├── hooks/ # Custom hooks
│ └── utils/ # Helper functions (question generator)
├── public/ # Public assets
├── package.json
├── vite.config.ts
└── README.md

```


1. Clone repository
git clone https://github.com/shreya841/resume-to-chat-ai.git
cd resume-to-chat-ai
2.Install dependencies
npm install
3.Start development server
npm run dev
4.Open in browser
http://localhost:8080/
