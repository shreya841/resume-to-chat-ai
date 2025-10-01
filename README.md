
# AI-Powered Interview Assistant (Crisp)

A React app that works as an AI-powered interview assistant with chat for candidates and a dashboard for interviewers. The system allows candidates to upload their resume, collect missing information, conduct a timed AI-generated interview, and automatically score and summarize the candidate. Interviewers can view candidates’ progress, chat history, and final scores.

---

## Features
 **Interviewee Tab**
  - Upload resume (PDF/DOCX)
  - Extract Name, Email, Phone
  - Chatbot collects missing information
  - Timed interview questions: 6 questions (2 Easy → 2 Medium → 2 Hard)
  - Auto-submit answers when time runs out
  - Final AI-generated score and summary

- **Interviewer Tab (Dashboard)**
  - List of candidates ordered by score
  - View each candidate’s chat history, profile, and summary
  - Search and sort candidates
  - Pause/resume interviews with “Welcome Back” modal

- **Persistence**
  - All timers, answers, and progress saved locally
  - Refreshing or closing the page restores sessions


** TechStack**

- **Frontend:** React + TypeScript  
- **Bundler:** Vite  
- **UI Library:** shadcn-ui + Tailwind CSS  
- **State Management & Persistence:** Redux / LocalStorage  
- **Development:** Node.js & npm

**Project Structure**
```
resume-to-chat-ai-main2/
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
**Installation**
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
```
## 🚀 Deployment

The project is live here: (https://resume-to-chat-ai.vercel.app)

Deployed on **Vercel** with automatic builds from the GitHub repository.  
Any changes pushed to the `main` branch are automatically reflected on the live site.
