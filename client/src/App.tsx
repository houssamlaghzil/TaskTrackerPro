import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { GameProvider } from "@/hooks/use-game";
import { Header } from "@/components/ui/Header";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CharacterPage from "@/pages/character-page";
import DonatePage from "@/pages/donate-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <div className="min-h-screen pt-16">
      <Header />
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/rooms/:roomId/characters/:characterId" component={CharacterPage} />
        <ProtectedRoute path="/donate" component={DonatePage} />
        <ProtectedRoute path="/donate/success" component={DonatePage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GameProvider>
          <Router />
          <Toaster />
        </GameProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;