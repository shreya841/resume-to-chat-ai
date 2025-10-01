import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Clock, 
  Code, 
  CheckCircle, 
  XCircle,
  Star,
  Download,
  Mail,
  FileText
} from "lucide-react";
import { InterviewSession } from "@/pages/IntervieweeTab";

interface ScoreCardProps {
  session: InterviewSession;
  onClose: () => void;
  onDownload?: () => void;
  onEmailReport?: () => void;
}

const ScoreCard = ({ session, onClose, onDownload, onEmailReport }: ScoreCardProps) => {
  const finalScore = session.finalScore || 0;
  const allQuestions = session.questions.filter(q => q.id !== "demo"); // Exclude demo question
  const totalQuestions = allQuestions.length;
  const totalMarksObtained = allQuestions.reduce((sum, q) => sum + (q.score || 0), 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elegant animate-scale-in">
        <CardHeader className="text-center bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-300" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Interview Completed!
          </CardTitle>
          <p className="text-lg opacity-90">
            {session.profile.name}
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(finalScore)}`}>
              {totalMarksObtained}<span className="text-2xl">/{totalQuestions * 100}</span>
            </div>
            <div className="text-lg text-muted-foreground">
              Average: {finalScore}/100
            </div>
            <Badge variant={getScoreBadgeVariant(finalScore)} className="text-lg px-4 py-2">
              {getPerformanceLevel(finalScore)}
            </Badge>
            <Progress value={finalScore} className="w-full h-3" />
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {Math.round(allQuestions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </div>

          {/* Question-wise Performance */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5" />
              Question-wise Performance
            </h3>
            {allQuestions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Q{index + 1}</span>
                    <Badge variant="outline">
                      {question.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {question.question}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-lg font-bold ${getScoreColor(question.score || 0)}`}>
                    {question.score || 0}
                  </div>
                  {(question.score || 0) >= 70 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Key Insights */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <h3 className="font-semibold mb-2">Performance Insights</h3>
            <ul className="text-sm space-y-1">
              {finalScore >= 80 && (
                <li className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Strong overall performance across all domains
                </li>
              )}
              <li className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Answered {totalQuestions} technical questions successfully
              </li>
              {finalScore < 60 && (
                <li className="flex items-center gap-2 text-amber-600">
                  <Target className="w-4 h-4" />
                  Consider reviewing core concepts for better performance
                </li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={onEmailReport}
              className="flex-1 min-w-[140px]"
              variant="outline"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Report
            </Button>
            <Button 
              onClick={onDownload}
              className="flex-1 min-w-[140px]"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1 min-w-[140px]"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreCard;