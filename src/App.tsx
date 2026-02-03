import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import Game from "./pages/Game";
import GameArena from "./pages/GameArena";
import Play from "./pages/Play";
import OnlineGame from "./pages/OnlineGame";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Credits from "./pages/Credits";
import Auth from "./pages/Auth";
import HowToPlay from "./pages/HowToPlay";
import CardLibrary from "./pages/CardLibrary";
import DeckBuilder from "./pages/DeckBuilder";
import Tutorial from "./pages/Tutorial";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import StoryMode from "./pages/StoryMode";
import StoryGame from "./pages/StoryGame";
import Friends from "./pages/Friends";

import { BackgroundMusic } from "./components/BackgroundMusic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/play" element={<ProtectedRoute><Play /></ProtectedRoute>} />
            <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
            <Route path="/gamearena" element={<ProtectedRoute><GameArena /></ProtectedRoute>} />
            <Route path="/online-game/:matchId" element={<ProtectedRoute><OnlineGame /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
            <Route path="/how-to-play" element={<ProtectedRoute><HowToPlay /></ProtectedRoute>} />
            <Route path="/card-library" element={<ProtectedRoute><CardLibrary /></ProtectedRoute>} />
            <Route path="/deck-builder" element={<ProtectedRoute><DeckBuilder /></ProtectedRoute>} />
            <Route path="/tutorial" element={<ProtectedRoute><Tutorial /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/story-mode" element={<ProtectedRoute><StoryMode /></ProtectedRoute>} />
            <Route path="/story-game/:regionId/:levelId" element={<ProtectedRoute><StoryGame /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/private-lobby/:inviteId" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BackgroundMusic />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
