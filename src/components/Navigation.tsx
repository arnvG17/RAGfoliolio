import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); // Trigger immediately on scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 
        backdrop-blur-xl border border-white/10 bg-background/40 rounded-full 
        shadow-lg flex items-center justify-between px-6 py-3
        transition-[max-width] duration-700 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]
        ${isScrolled ? "max-w-[650px]" : "max-w-[900px]"}`}
      style={{
        width: "90%", // keeps height constant, only width changes
      }}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2 text-xl font-bold text-accent">
        <span>⚛</span> <span>Arnv</span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center space-x-8">
        <button
          onClick={() => scrollToSection("home")}
          className="text-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
        >
          Home
        </button>
        <button
          onClick={() => scrollToSection("about")}
          className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
        >
          About
        </button>
        <button
          onClick={() => scrollToSection("projects")}
          className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
        >
          Projects
        </button>
        <button
          onClick={() => scrollToSection("contact")}
          className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
        >
          Contact
        </button>
      </div>

      {/* Resume Button */}
      <Button
        asChild
        className="ml-4 rounded-full px-6 py-2" // capsule shape
      >
        <a
          href="https://flowcv.com/resume/4sse35818k"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
        </a>
      </Button>
    </nav>
  );
};

export default Navigation;
