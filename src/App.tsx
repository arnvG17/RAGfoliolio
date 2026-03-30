import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import CinematicHero from "./components/CinematicHero";
import ProjectsSection from "./components/ProjectsSection";
import ContactSection from "./components/ContactSection";
import DitherTrail from "./components/cursor-dither-trail";
import Noise from "./components/Noise";
import ChatWidget from "./components/ChatWidget.jsx"


import "./font/fonts.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        
        {/* Background effect rendered on every page */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <DitherTrail />
          <Noise />
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div className="relative">
                <Navigation />
                <main>
                  <CinematicHero />
                  <ChatWidget/>
                  <ProjectsSection />
                  <ContactSection />
                </main>
              </div>
            }
          />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
