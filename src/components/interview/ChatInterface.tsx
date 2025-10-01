
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { CandidateProfile, InterviewSession, Question } from "@/pages/IntervieweeTab";
import { useToast } from "@/hooks/use-toast";
import { isDemoQuestion } from "@/utils/questionGenerator";
import CodeCompiler from "./CodeCompiler";

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  session: InterviewSession | null;
  mode: "info_collection" | "interview";
  onInfoComplete?: (profile: CandidateProfile) => void;
  onInterviewComplete?: (session: InterviewSession) => void;
  onRestartInterview?: () => void;
}

const evaluateAnswer = (question: Question, answer: string): number => {
    const answerText = answer.toLowerCase().trim();
    if (answerText.length < 15 || answerText === "no answer provided") return 0;
    const questionText = question.question.toLowerCase();

    const getExpectedKeywords = (q: string): string[] => {
        if (q.includes("javascript") && (q.includes("var") || q.includes("let"))) return ["scope", "hoisting", "function-scoped", "block-scoped", "let", "const"];
        if (q.includes("react") && (q.includes("state") || q.includes("props"))) return ["usestate", "hook", "re-render", "component", "props", "immutable", "virtual dom"];
        if (q.includes("promise")) return ["async", "await", "then", "catch", "pending", "fulfilled", "rejected", "callback"];
        if (q.includes("api") || q.includes("rest")) return ["http", "get", "post", "put", "delete", "endpoint", "json", "status code", "header"];
        if (q.includes("database") && (q.includes("sql") || q.includes("nosql"))) return ["relational", "non-relational", "schema", "query", "scalability", "document", "mongodb", "postgresql"];
        return q.replace(/[?.,]/g, '').split(' ').filter(word => word.length > 4);
    };



    const expectedKeywords = question.expectedKeywords || getExpectedKeywords(questionText);
    if (expectedKeywords.length === 0) return answerText.length > 100 ? 70 : answerText.length > 50 ? 50 : 30;

    const keywordMatches = expectedKeywords.filter(keyword => answerText.includes(keyword)).length;
    const accuracyScore = (keywordMatches / expectedKeywords.length) * 70;

    let completenessScore = 0;
    if (answerText.length > 85) completenessScore += 10;
    if (answerText.length > 150) completenessScore += 5;
    if (answerText.includes("example") || answerText.includes("for instance")) completenessScore += 10;
    if (answerText.split(/[.!?]/).length > 2) completenessScore += 5;

    let penalty = 0;
    if (answerText.includes("i don't know") || answerText.includes("not sure")) penalty = 40;

    let finalScore = Math.round(accuracyScore + completenessScore - penalty);
    finalScore = Math.max(0, Math.min(100, finalScore));

    if (keywordMatches > 0 && finalScore < 25) return 25;
    return finalScore;
};

const ChatInterface = ({ session, mode, onInfoComplete, onInterviewComplete, onRestartInterview }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isWaiting, setIsWaiting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isWaitingForStart, setIsWaitingForStart] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    if (!session) {
        return (
            <Card className="h-[70vh] flex flex-col items-center justify-center">
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Session Error</CardTitle></CardHeader>
                <CardContent><p>Could not load interview session.</p></CardContent>
            </Card>
        );
    }
    
    const currentQuestion = session.questions[currentQuestionIndex];
    const showCodeCompiler = currentQuestion?.isCoding && !isDemoQuestion(currentQuestion.id);

    useEffect(() => {
        if (mode === "info_collection") initializeInfoCollection();
        else if (mode === "interview") initializeInterview();
    }, [mode, session.profile.id]);

   useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
}, [messages, isWaiting]);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isWaiting]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeRemaining]);
    
    const addBotMessage = (content: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), type: "bot", content, timestamp: Date.now() }]);
        setIsWaiting(false);
    };
    
    const initializeInfoCollection = () => {
        if (!session.profile.name) addBotMessage("Hello! Let's start with your full name.");
        else if (!session.profile.email) addBotMessage("Thanks! What's your email address?");
        else if (!session.profile.phone) addBotMessage("Great! And your phone number?");
        else {
            addBotMessage(`Perfect, I have all your details:\n\n• **Name:** ${session.profile.name}\n• **Email:** ${session.profile.email}\n• **Phone:** ${session.profile.phone}\n\nType **"start"** when you're ready to begin the interview!`);
            setIsWaitingForStart(true);
        }
    };

const initializeInterview = () => {
    addBotMessage("Welcome! Let's start the interview. Good luck!");
    
    // Skip all demo questions at the start
    let firstRealIndex = 0;
    while (firstRealIndex < session.questions.length && isDemoQuestion(session.questions[firstRealIndex].id)) {
        firstRealIndex++;
    }
    
    setCurrentQuestionIndex(firstRealIndex); // Start from first real question
    setTimeout(() => askNextQuestion(), 1500);
};

const askNextQuestion = () => {
    if (currentQuestionIndex >= session.questions.length) {
        completeInterview();
        return;
    }

    const question = session.questions[currentQuestionIndex];
    const actualQuestionNumber = session.questions
        .slice(0, currentQuestionIndex + 1)
        .filter(q => !isDemoQuestion(q.id)).length;

    addBotMessage(`**Question ${actualQuestionNumber}** (${question.difficulty} - ${question.timeLimit}s)\n\n${question.question}`);
    setTimeRemaining(question.timeLimit);
    setIsTimerActive(true);
};

    const handleTimeUp = () => {
        setIsTimerActive(false);
        addBotMessage("⏰ Time's up! Let's move to the next question.");
        handleInterviewResponse(currentMessage || "No answer provided (time out)");
    };
    
    const handleSendMessage = () => {
        const trimmedMessage = currentMessage.trim();
        if (!trimmedMessage) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", content: trimmedMessage, timestamp: Date.now() }]);
        setCurrentMessage("");
        setIsWaiting(true);
        setTimeout(() => {
            if (mode === 'info_collection') handleInfoCollectionResponse(trimmedMessage);
            else if (mode === 'interview') handleInterviewResponse(trimmedMessage);
        }, 1000);
    };

    const handleInfoCollectionResponse = (response: string) => {
        if (isWaitingForStart) {
            if (response.toLowerCase() === 'start') {
                if (onInfoComplete) onInfoComplete(session.profile);
            } else {
                addBotMessage('Please type **"start"** to begin.');
                setIsWaitingForStart(true);
            }
            return;
        }
  

    const updatedProfile = { ...session.profile };

    // Name validation
    if (!updatedProfile.name) {
        if (response.trim().split(" ").length < 2) {
            addBotMessage("Please provide your full name (first and last name).");
            return;
        } else {
            updatedProfile.name = response.trim();
            addBotMessage(`Hello ${updatedProfile.name.split(" ")[0]}!`);
        }
    } 
    // Email validation
    else if (!updatedProfile.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(response.trim())) {
            addBotMessage("Enter a valid email address.");
            return;
        } else {
            updatedProfile.email = response.trim();
        }
    } 
    // Phone validation
    else if (!updatedProfile.phone) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(response.trim())) {
            addBotMessage("Enter a valid 10-digit phone number.");
            return;
        } else {
            updatedProfile.phone = response.trim();
        }
    }

    session.profile = updatedProfile;
    initializeInfoCollection();
};


    const handleInterviewResponse = (response: string) => {
        setIsTimerActive(false);
        const question = session.questions[currentQuestionIndex];
        if (question) {
            question.answer = response;
            question.score = isDemoQuestion(question.id) ? 0 : evaluateAnswer(question, response);
        }
        const isLastQuestion = currentQuestionIndex >= session.questions.length - 1;
        if (isLastQuestion) completeInterview();
        else {
            addBotMessage("Answer received. Here is your next question.");
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeout(() => askNextQuestion(), 1500);
        }
    };
    
    const completeInterview = () => {
        setIsTimerActive(false);
        const scoredQuestions = session.questions.filter(q => !isDemoQuestion(q.id));
        const averageScore = scoredQuestions.length > 0 ? Math.round(scoredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / scoredQuestions.length) : 0;
        const completedSession: InterviewSession = { ...session, status: "completed", finalScore: averageScore, summary: "Summary would be generated here." };
        addBotMessage(`🎉 **Interview Complete!**\n\nYour final score is: **${averageScore}/100**.`);
        if (onInterviewComplete) onInterviewComplete(completedSession);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (showCodeCompiler) return <CodeCompiler question={currentQuestion.question} onSubmit={handleInterviewResponse} timeRemaining={timeRemaining} isActive={isTimerActive} />;

    return (
        <Card className="h-[80vh] w-full max-w-3xl mx-auto flex flex-col shadow-lg">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-lg"><Bot className="w-6 h-6 text-primary" />AI Interviewer</span>
                    {mode === "interview" && (
                        <div className="flex items-center gap-4">
                            <Badge variant="outline">
                                Q {session.questions.filter(q => !isDemoQuestion(q.id)).slice(0, currentQuestionIndex).length + (isDemoQuestion(currentQuestion.id) ? 0 : 1)} of {session.questions.filter(q => !isDemoQuestion(q.id)).length}
                            </Badge>
                            {isTimerActive && (
                                <div className={`flex items-center gap-1.5 font-mono text-lg ${timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                                    <Clock className="w-5 h-5" />
                                    {formatTime(timeRemaining)}
                                </div>
                            )}
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 overflow-y-auto">

                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 items-start ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.type === "bot" && <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-primary-foreground" /></div>}
                                <div className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    <div className="text-xs opacity-60 mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                {msg.type === "user" && <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-muted-foreground" /></div>}
                            </div>
                        ))}
                        {isWaiting && <div className="flex gap-4 justify-start items-center"><div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-primary-foreground" /></div><div className="bg-muted rounded-lg px-4 py-3"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" /><div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" /><div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" /></div></div></div>}


                    </div>
                       <div ref={bottomRef} />
                </ScrollArea>
               
                <div className="p-4 border-t bg-background">
                    <div className="flex gap-2 items-start">
                        <Textarea
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder={isTimerActive ? "Type your answer here..." : "Type your message..."}
                            className="flex-1 min-h-[48px] max-h-36 resize-none"
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            disabled={isWaiting}
                        />
                        <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isWaiting} size="icon" className="h-12 w-12 flex-shrink-0">
                            <Send className="w-5 h-5" />
                        </Button>
                        {onRestartInterview && <Button onClick={onRestartInterview} variant="destructive" size="icon" className="h-12 w-12 flex-shrink-0"><RefreshCw className="w-5 h-5" /></Button>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatInterface;