import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DirectionProvider } from "@radix-ui/react-direction";
import MainLayout from "./components/layout/MainLayout";
import IntervieweeTab from "./pages/IntervieweeTab";
import InterviewerTab from "./pages/InterviewerTab";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<IntervieweeTab />} />
        <Route path="/interviewer" element={<InterviewerTab />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DirectionProvider dir="ltr">
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </DirectionProvider>
  </QueryClientProvider>
);

export default App;
