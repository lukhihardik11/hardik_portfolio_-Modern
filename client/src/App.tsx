/**
 * App.tsx — Root application shell.
 * Provider stack: ErrorBoundary → ThemeProvider → JellyModeProvider → AnimationProvider → TooltipProvider → Router
 * Global layers: CustomCursor (desktop only), ScrollProgress
 * Route wrapper: PageTransition (GSAP overlay slide)
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { JellyModeProvider } from "./contexts/JellyModeContext";
import { AnimationProvider } from "./components/animation/AnimationProvider";
import { CustomCursor } from "./components/animation/CustomCursor";
import { ScrollProgress } from "./components/ScrollProgress";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";

function Router() {
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/project/:id" component={ProjectPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <JellyModeProvider>
          <AnimationProvider>
            <TooltipProvider>
              <Toaster />
              <ScrollProgress />
              <CustomCursor />
              <Router />
            </TooltipProvider>
          </AnimationProvider>
        </JellyModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
