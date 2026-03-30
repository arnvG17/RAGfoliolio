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
      className={`fixed top-6 max-[900px]:left-1/2 min-[901px]:left-[32.5%] -translate-x-1/2 z-50 
        backdrop-blur-xl border rounded-full w-[94%] min-[901px]:w-[60%]
        flex items-center justify-between py-3
        transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]
        ${isScrolled 
          ? "max-[900px]:max-w-[700px] min-[901px]:max-w-[600px] px-6 bg-white/5 border-white/5 shadow-none" 
          : "max-[900px]:max-w-[1100px] min-[901px]:max-w-[950px] px-8 bg-background/40 border-white/10 shadow-lg"}`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2 text-xl font-bold text-accent">
        <span>⚛</span> <span>Arnv</span>
      </div>

      {/* Links */}
      <div className={`hidden md:flex items-center transition-all duration-700 ${isScrolled ? "space-x-2 xl:space-x-4" : "space-x-4 xl:space-x-8"}`}>
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
        className={`rounded-full transition-all duration-700 ${isScrolled ? "ml-2 px-4 py-2" : "ml-4 px-6 py-2"}`} // capsule shape
      >
        <a
          href="/Arnav_Gawandi_Resume.pdf"
          download="Arnav_Gawandi_Resume.pdf"
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
