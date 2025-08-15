import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById("home")?.offsetHeight || 300;
      setIsScrolled(window.scrollY > heroHeight - 80);
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
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 
        backdrop-blur-xl border border-white/10 bg-background/40 rounded-full 
        shadow-lg flex items-center justify-between px-6 
        ${isScrolled ? "scale-90 py-2" : "scale-100 py-4"}`}
      style={{
        maxWidth: "900px",
        width: "90%",
      }}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2 text-xl font-bold text-accent">
        <span>⚛</span> <span>React Bits</span>
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

      {/* Theme toggle */}
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex border-accent/20 text-accent hover:bg-accent/10 hover:border-accent/40"
      >
        🌙
      </Button>
    </nav>
  );
};

export default Navigation;
