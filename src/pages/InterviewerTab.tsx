

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw, Search, User, Clock, Trophy, ArrowUpDown, Eye, Trash2 } from "lucide-react";
import { InterviewSession, Question, CandidateProfile } from "@/pages/IntervieweeTab";

interface CompletedCandidate extends InterviewSession {
  completedAt: string;
}

const InterviewerTab = () => {
  const [candidates, setCandidates] = useState<CompletedCandidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCandidate, setSelectedCandidate] = useState<CompletedCandidate | null>(null);

  useEffect(() => {
    const loadAndProcessCandidates = () => {
      const savedCandidates = localStorage.getItem("crisp_candidates");
      if (savedCandidates) {
        try {
          const parsed: CompletedCandidate[] = JSON.parse(savedCandidates);
          const processedCandidates = parsed.map(candidate => {
            if (candidate.questions && candidate.questions.length > 0) {
              const scoredQuestions = candidate.questions.filter(q => q.id !== 'demo');
              const totalScore = scoredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
              const finalScore = scoredQuestions.length > 0 ? Math.round(totalScore / scoredQuestions.length) : 0;
              return { ...candidate, finalScore };
            }
            return { ...candidate, finalScore: 0 };
          });
          setCandidates(processedCandidates);
        } catch (error) {
          console.error("Failed to load or process candidates:", error);
        }
      }
    };
    loadAndProcessCandidates();
  }, []);

  const deleteCandidate = (candidateId: string) => {
    const updatedCandidates = candidates.filter(c => c.profile.id !== candidateId);
    setCandidates(updatedCandidates);
    localStorage.setItem("crisp_candidates", JSON.stringify(updatedCandidates));
  };

  const filteredAndSortedCandidates = candidates
    .filter(candidate =>
      candidate.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "score": comparison = (a.finalScore || 0) - (b.finalScore || 0); break;
        case "date": comparison = new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(); break;
        case "name": comparison = a.profile.name.localeCompare(b.profile.name); break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-600 text-white";
    if (score >= 60) return "bg-yellow-500 text-white";
    return "bg-red-600 text-white";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
        setSortBy(newSortBy);
        setSortOrder("desc");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h2 className="text-3xl font-bold text-foreground mb-4">Interview Dashboard</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto md:flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleSort("score")}><Trophy className="w-4 h-4 mr-2" /> Sort by Score</Button>
            <Button variant="outline" size="sm" onClick={() => toggleSort("date")}><Clock className="w-4 h-4 mr-2" /> Sort by Date</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAndSortedCandidates.length > 0 ? (
          filteredAndSortedCandidates.map((candidate) => (
            <Card key={candidate.profile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {candidate.profile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{candidate.profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(candidate.completedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getScoreColor(candidate.finalScore || 0)} text-base`}>
                    {candidate.finalScore || 0}%
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => deleteCandidate(candidate.profile.id)}><Trash2 className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={() => setSelectedCandidate(candidate)}>
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Candidates Found</h3>
            <p className="text-muted-foreground">Completed interviews will appear here.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedCandidate} onOpenChange={(isOpen) => !isOpen && setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Interview Report: {selectedCandidate.profile.name}</DialogTitle>
              </DialogHeader>
              {/* FIX: Added 'flex-1' to make this div take up all available space and allow scrolling */}
              <div className="flex-1 space-y-6 overflow-y-auto p-1 pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedCandidate.finalScore || 0).split(' ')[0]}`}>
                        {selectedCandidate.finalScore || 0}%
                      </div>
                      <p className="text-muted-foreground">{selectedCandidate.summary || "The AI summary provides insights into the candidate's strengths and areas for improvement."}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Question Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCandidate.questions.filter(q => q.id !== 'demo').map((q, index) => (
                      <div key={q.id || index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Question {index + 1}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                            <Badge className={getScoreColor(q.score || 0)}>{q.score || 0}%</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{q.question}</p>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Candidate's Answer</p>
                          <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{q.answer || "Not answered"}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewerTab;