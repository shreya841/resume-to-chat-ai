import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Trophy, AlertTriangle } from "lucide-react";
import { InterviewSession } from "@/pages/IntervieweeTab";

interface InterviewTimerProps {
  session: InterviewSession;
  onTimeUp: () => void;
}

const InterviewTimer = ({ session, onTimeUp }: InterviewTimerProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentQuestion = () => {
    if (session.currentQuestion >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentQuestion];
  };

  const getProgress = () => {
    return ((session.currentQuestion + 1) / session.questions.length) * 100;
  };

  const getCompletedQuestions = () => {
    return session.questions.filter(q => q.answer !== undefined).length;
  };

  const getAverageScore = () => {
    const completedQuestions = session.questions.filter(q => q.score !== undefined);
    if (completedQuestions.length === 0) return 0;
    
    const totalScore = completedQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    return Math.round(totalScore / completedQuestions.length);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-success text-success-foreground";
      case "Medium": return "bg-warning text-warning-foreground";
      case "Hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const completedQuestions = getCompletedQuestions();
  const averageScore = getAverageScore();

  return (
    <div className="space-y-4">
      {/* Interview Progress */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Questions Completed</span>
              <span>{completedQuestions}/{session.questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {averageScore > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Score</span>
              <Badge variant="outline" className="font-medium">
                {averageScore}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Question Info */}
      {currentQuestion && (
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Question</span>
              <span className="font-medium">
                {session.currentQuestion + 1} of {session.questions.length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Difficulty</span>
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time Limit</span>
              <span className="font-medium">{currentQuestion.timeLimit}s</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Info */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Candidate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="font-medium">{session.profile.name || "Name not provided"}</p>
            <p className="text-sm text-muted-foreground">{session.profile.email || "Email not provided"}</p>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Started</span>
              <span>{new Date(session.profile.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Overview */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Questions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {session.questions.map((question, index) => (
              <div
                key={question.id}
                className={`flex items-center justify-between p-2 rounded ${
                  index === session.currentQuestion
                    ? "bg-primary/10 border border-primary/20"
                    : question.answer
                    ? "bg-success/10"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Q{index + 1}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getDifficultyColor(question.difficulty)}`}
                  >
                    {question.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {question.score !== undefined && (
                    <span className="text-xs font-medium">{question.score}%</span>
                  )}
                  
                  {index === session.currentQuestion && (
                    <Clock className="w-3 h-3 text-primary" />
                  )}
                  
                  {question.answer && index !== session.currentQuestion && (
                    <div className="w-2 h-2 bg-success rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      <Card className="shadow-soft border-warning/20 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Take your time to think before answering</li>
            <li>• Explain your thought process</li>
            <li>• Ask for clarification if needed</li>
            <li>• Watch the timer for each question</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewTimer;