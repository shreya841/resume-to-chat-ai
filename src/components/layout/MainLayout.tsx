import { useState, useEffect, ReactNode } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Briefcase } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  const currentTab = location.pathname === "/interviewer" ? "interviewer" : "interviewee";

  const handleTabChange = (value: string) => {
    navigate(value === "interviewer" ? "/interviewer" : "/");
  };

  // Check for unfinished sessions on mount
  useEffect(() => {
    const hasUnfinishedSession = localStorage.getItem("crisp_current_interview");
    if (hasUnfinishedSession && !sessionStorage.getItem("crisp_session_restored")) {
      setShowWelcomeBack(true);
    }
  }, []);

  const handleWelcomeBack = (resume: boolean) => {
    if (!resume) {
      localStorage.removeItem("crisp_current_interview");
    }
    sessionStorage.setItem("crisp_session_restored", "true");
    setShowWelcomeBack(false);
  };

  return (
    <div className="min-h-screen bg-gradient-muted">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Crisp</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Interview Assistant</p>
              </div>
            </Link>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-auto">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="interviewee" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Interviewee
                </TabsTrigger>
                <TabsTrigger value="interviewer" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Interviewer
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-5rem)]">
        {children}
      </main>

      {/* Welcome Back Modal */}
      <Dialog open={showWelcomeBack} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Welcome Back!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-6">
              We found an unfinished interview session. Would you like to continue where you left off?
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => handleWelcomeBack(false)}
              >
                Start Fresh
              </Button>
              <Button onClick={() => handleWelcomeBack(true)}>
                Continue Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;