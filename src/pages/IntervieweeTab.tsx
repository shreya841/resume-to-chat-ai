// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Clock } from "lucide-react";
// import ResumeUpload from "@/components/interview/ResumeUpload";
// import ChatInterface from "@/components/interview/ChatInterface";
// import InterviewTimer from "@/components/interview/InterviewTimer";
// import ScoreCard from "@/components/interview/ScoreCard";
// import { useToast } from "@/hooks/use-toast";
// import { generateRandomQuestions } from "@/utils/questionGenerator";

// export interface CandidateProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   resumeText: string;
//   resumeFileName: string;
//   createdAt: string;
// }

// export interface InterviewSession {
//   profile: CandidateProfile;
//   currentQuestion: number;
//   questions: Array<{
//     id: string;
//     question: string;
//     difficulty: "Easy" | "Medium" | "Hard";
//     timeLimit: number;
//     answer?: string;
//     score?: number;
//     startTime: number;
//     isCoding?: boolean; // For coding questions
//   }>;
//   status: "collecting_info" | "in_progress" | "completed";
//   finalScore?: number;
//   summary?: string;
// }

// const IntervieweeTab = () => {
//   const [session, setSession] = useState<InterviewSession | null>(null);
//   const [currentStep, setCurrentStep] = useState<"upload" | "info" | "interview">("upload");
//   const [showScoreCard, setShowScoreCard] = useState(false);
//   const { toast } = useToast();

//   useEffect(() => {
//     // Restore session if exists
//     const savedSession = localStorage.getItem("crisp_current_interview");
//     if (savedSession) {
//       try {
//         const parsedSession: InterviewSession = JSON.parse(savedSession);
//         setSession(parsedSession);
        
//         if (parsedSession.status === "collecting_info") {
//           setCurrentStep("info");
//         } else if (parsedSession.status === "in_progress") {
//           setCurrentStep("interview");
//         }
//       } catch (error) {
//         console.error("Failed to restore session:", error);
//         localStorage.removeItem("crisp_current_interview");
//       }
//     }
//   }, []);

//   const handleResumeUploaded = (profile: CandidateProfile) => {
//     const newSession: InterviewSession = {
//       profile,
//       currentQuestion: 0,
//       questions: [],
//       status: "collecting_info",
//     };
    
//     setSession(newSession);
//     setCurrentStep("info");
//     localStorage.setItem("crisp_current_interview", JSON.stringify(newSession));
    
//     toast({
//       title: "Resume uploaded successfully!",
//       description: "Let's collect any missing information before starting.",
//     });
//   };

//   const handleInfoComplete = (updatedProfile: CandidateProfile) => {
//     if (!session) return;
    
//     const updatedSession: InterviewSession = {
//       ...session,
//       profile: updatedProfile,
//       status: "in_progress",
//       questions: generateRandomQuestions(),
//     };
    
//     setSession(updatedSession);
//     setCurrentStep("interview");
//     localStorage.setItem("crisp_current_interview", JSON.stringify(updatedSession));
    
//     toast({
//       title: "Ready to start!",
//       description: "Your interview will begin in a moment.",
//     });
//   };

//   const generateInterviewQuestions = () => {
//     return generateRandomQuestions();
//   };

//   const handleInterviewComplete = (completedSession: InterviewSession) => {
//     // Add completedAt timestamp for interviewer tab
//     const sessionWithTimestamp = {
//       ...completedSession,
//       completedAt: new Date().toISOString()
//     };
    
//     // Save completed session to candidates (for interviewer tab)
//     const candidates = JSON.parse(localStorage.getItem("crisp_candidates") || "[]");
//     candidates.push(sessionWithTimestamp);
//     localStorage.setItem("crisp_candidates", JSON.stringify(candidates));
    
//     // Show scorecard
//     setShowScoreCard(true);
    
//     toast({
//       title: "Interview Completed!",
//       description: "Your interview has been successfully completed and saved.",
//     });
//   };

//   const handleScoreCardClose = () => {
//     setShowScoreCard(false);
//     // Clear current session
//     localStorage.removeItem("crisp_current_interview");
//     // Reset state
//     setSession(null);
//     setCurrentStep("upload");
//   };

//   const handleEmailReport = () => {
//     if (!session) return;
    
//     const scoredQuestions = session.questions.filter(q => q.id !== "demo");
//     const totalScore = scoredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    
//     const subject = encodeURIComponent(`Interview Report - ${session.profile.name}`);
//     const body = encodeURIComponent(`
// Interview Report for ${session.profile.name}

// === CANDIDATE INFORMATION ===
// Name: ${session.profile.name}
// Email: ${session.profile.email}
// Phone: ${session.profile.phone}
// Resume: ${session.profile.resumeFileName}

// === INTERVIEW RESULTS ===
// Final Score: ${session.finalScore}/100
// Total Questions Answered: ${scoredQuestions.length}
// Total Marks Obtained: ${totalScore}/${scoredQuestions.length * 100}

// === QUESTION-WISE PERFORMANCE ===
// ${scoredQuestions.map((q, i) => `Q${i + 1}: ${q.score || 0}/100 (${q.difficulty}${q.isCoding ? ' - Coding' : ''})`).join('\n')}

// === SUMMARY ===
// ${session.summary || 'Performance summary not available'}

// Interview Date: ${new Date().toLocaleDateString()}
// Interview Time: ${new Date().toLocaleTimeString()}

// This report was generated by CRISP Technical Interview System.
//     `.trim());
    
//     window.open(`mailto:${session.profile.email}?subject=${subject}&body=${body}`);
//   };

//   const handleDownloadReport = () => {
//     toast({
//       title: "Download feature",
//       description: "PDF download will be available soon!",
//     });
//   };

//   const handleRestartInterview = () => {
//     // Clear current session
//     localStorage.removeItem("crisp_current_interview");
//     // Reset state
//     setSession(null);
//     setCurrentStep("upload");
    
//     toast({
//       title: "Interview Restarted",
//       description: "You can start fresh with a new resume upload.",
//     });
//   };

//   return (
//     <div className="container mx-auto p-6 max-w-4xl">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-center mb-2">
//           Technical Interview Portal
//         </h1>
//         <p className="text-center text-muted-foreground">
//           Complete your technical assessment with our AI interviewer
//         </p>
//       </div>

//       {currentStep === "upload" && (
//         <Card className="shadow-medium">
//           <CardHeader>
//             <CardTitle>Upload Your Resume</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResumeUpload onResumeUploaded={handleResumeUploaded} />
//           </CardContent>
//         </Card>
//       )}

//       {currentStep === "info" && session && (
//         <ChatInterface
//           session={session}
//           mode="info_collection"
//           onInfoComplete={handleInfoComplete}
//         />
//       )}

//       {currentStep === "interview" && session && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-1">
//             <InterviewTimer session={session} onTimeUp={() => {}} />
//           </div>
//           <div className="lg:col-span-2">
//             <ChatInterface
//               session={session}
//               mode="interview"
//               onInterviewComplete={handleInterviewComplete}
//               onRestartInterview={handleRestartInterview}
//             />
//           </div>
//         </div>
//       )}

//       {showScoreCard && session && (
//         <ScoreCard
//           session={session}
//           onClose={handleScoreCardClose}
//           onEmailReport={handleEmailReport}
//           onDownload={handleDownloadReport}
//         />
//       )}
//     </div>
//   );
// };

// export default IntervieweeTab;















































import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumeUpload from "@/components/interview/ResumeUpload";
import ChatInterface from "@/components/interview/ChatInterface";
import ScoreCard from "@/components/interview/ScoreCard";
import { useToast } from "@/hooks/use-toast";
import { generateRandomQuestions } from "@/utils/questionGenerator";

// FIX 1: Constants for local storage keys to prevent typos
const CURRENT_INTERVIEW_KEY = "crisp_current_interview";
const COMPLETED_CANDIDATES_KEY = "crisp_candidates";

// FIX 2: Exported interfaces for better reusability and modularity
export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  resumeFileName: string;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  answer?: string;
  score?: number;
  startTime: number;
  isCoding?: boolean;
  expectedKeywords?: string[];
}

export interface InterviewSession {
  profile: CandidateProfile;
  currentQuestion: number;
  questions: Question[]; // Uses the exported Question type
  status: "collecting_info" | "in_progress" | "completed";
  finalScore?: number;
  summary?: string;
}

const IntervieweeTab = () => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentStep, setCurrentStep] = useState<"upload" | "info" | "interview">("upload");
  const [showScoreCard, setShowScoreCard] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Restore session if it exists in local storage
    const savedSession = localStorage.getItem(CURRENT_INTERVIEW_KEY);
    if (savedSession) {
      try {
        const parsedSession: InterviewSession = JSON.parse(savedSession);
        setSession(parsedSession);
        
        if (parsedSession.status === "collecting_info") {
          setCurrentStep("info");
        } else if (parsedSession.status === "in_progress") {
          setCurrentStep("interview");
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem(CURRENT_INTERVIEW_KEY);
      }
    }
  }, []);

  const handleResumeUploaded = (profile: CandidateProfile) => {
    const newSession: InterviewSession = {
      profile,
      currentQuestion: 0,
      questions: [], // Questions will be generated after info collection
      status: "collecting_info",
    };
    
    setSession(newSession);
    setCurrentStep("info");
    localStorage.setItem(CURRENT_INTERVIEW_KEY, JSON.stringify(newSession));
    
    toast({
      title: "Resume Uploaded!",
      description: "Please verify your information before we begin.",
    });
  };

  const handleInfoComplete = (updatedProfile: CandidateProfile) => {
    if (!session) return;
    
    const updatedSession: InterviewSession = {
      ...session,
      profile: updatedProfile,
      status: "in_progress",
      questions: generateRandomQuestions(), // Generate questions now
    };
    
    setSession(updatedSession);
    setCurrentStep("interview");
    localStorage.setItem(CURRENT_INTERVIEW_KEY, JSON.stringify(updatedSession));
    
    toast({
      title: "Ready to Start!",
      description: "Your interview will begin in a moment.",
    });
  };

  const handleInterviewComplete = (completedSession: InterviewSession) => {
    const sessionWithTimestamp = {
      ...completedSession,
      completedAt: new Date().toISOString()
    };
    
    const candidates = JSON.parse(localStorage.getItem(COMPLETED_CANDIDATES_KEY) || "[]");
    candidates.push(sessionWithTimestamp);
    localStorage.setItem(COMPLETED_CANDIDATES_KEY, JSON.stringify(candidates));
    
    setShowScoreCard(true);
    
    toast({
      title: "Interview Completed!",
      description: "Your results have been saved.",
    });
  };

  const handleScoreCardClose = () => {
    setShowScoreCard(false);
    localStorage.removeItem(CURRENT_INTERVIEW_KEY);
    setSession(null);
    setCurrentStep("upload");
  };

  const handleRestartInterview = () => {
    localStorage.removeItem(CURRENT_INTERVIEW_KEY);
    setSession(null);
    setCurrentStep("upload");
    setShowScoreCard(false);
    
    toast({
      title: "Interview Restarted",
      description: "You can now start a new interview.",
    });
  };

  const handleEmailReport = () => {
    if (!session) return;
    
    const subject = encodeURIComponent(`Interview Report - ${session.profile.name}`);
    const body = encodeURIComponent(
      `Interview Report for ${session.profile.name}\n\n` +
      `Final Score: ${session.finalScore}/100\n` +
      `Summary: ${session.summary || 'N/A'}`
    );
    
    window.open(`mailto:${session.profile.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          Technical Interview Portal
        </h1>
        <p className="text-center text-muted-foreground">
          Complete your technical assessment with our AI interviewer.
        </p>
      </div>

      {currentStep === "upload" && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUpload onResumeUploaded={handleResumeUploaded} />
          </CardContent>
        </Card>
      )}

      {currentStep === "info" && session && (
        <ChatInterface
          session={session}
          mode="info_collection"
          onInfoComplete={handleInfoComplete}
          onRestartInterview={handleRestartInterview}
        />
      )}

      {/* FIX 3: Simplified interview step. ChatInterface now handles its own timer UI. */}
      {currentStep === "interview" && session && (
        <div>
          <ChatInterface
            session={session}
            mode="interview"
            onInterviewComplete={handleInterviewComplete}
            onRestartInterview={handleRestartInterview}
          />
        </div>
      )}

      {showScoreCard && session && (
        <ScoreCard
          session={session}
          onClose={handleScoreCardClose}
          onEmailReport={handleEmailReport}
          onDownload={() => toast({ title: "PDF Download coming soon!" })}
        />
      )}
    </div>
  );
};

export default IntervieweeTab;