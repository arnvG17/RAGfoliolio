import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Intersection Observer for Sections tracking
    const observer = new IntersectionObserver(
      (entries) => {
        let isProjectOrContact = false;
        let mostVisibleSection = activeSection;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            mostVisibleSection = entry.target.id;
            // ONLY Projects section triggers full width
            if (entry.target.id === "projects") {
              isProjectOrContact = true;
            }
          }
        });

        setIsFullWidth(isProjectOrContact);
        setActiveSection(mostVisibleSection);
      },
      { 
        threshold: 0.05, // More sensitive triggering
        rootMargin: "20% 0px 20% 0px" // Pre-emptively trigger transitions
      }
    );

    const sections = ["home", "about", "expertise", "projects", "contact", "further-content"];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-8 z-50 transition-all duration-700 ease-[cubic-bezier(0.2, 0.8, 0.2, 1)]
        backdrop-blur-xl border rounded-full 
        flex items-center justify-between py-3
        -translate-x-1/2
        ${isFullWidth 
          ? "w-[96%] md:w-[94%] max-w-[1400px] px-8 bg-background/80 border-white/20 shadow-2xl py-4" 
          : "w-[94%] md:w-[50%] max-w-[900px] px-8 bg-background/40 border-white/10 shadow-lg"}`}
      style={{ 
        left: isFullWidth ? '50%' : (typeof window !== 'undefined' && window.innerWidth > 900 ? 'calc(30% + 20px)' : '50%') 
      }}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2 text-xl font-bold text-accent">
        <span>⚛</span> <span>Arnv</span>
      </div>

      {/* Links */}
      <div className={`hidden md:flex items-center transition-all duration-700 ${isFullWidth ? "space-x-8" : "space-x-4"}`}>
        {[
          { id: "home", label: "Home" },
          { id: "about", label: "About" },
          { id: "projects", label: "Projects" },
          { id: "contact", label: "Contact" }
        ].map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className={`transition-colors duration-200 text-sm font-medium hover:text-accent
              ${activeSection === link.id ? "text-accent font-bold" : "text-foreground/70"}`}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Resume Button */}
      <Button
        asChild
        className={`rounded-full transition-all duration-700 ${
          isFullWidth 
            ? "px-8 py-3 text-base bg-accent text-accent-foreground hover:bg-accent/90" 
            : "px-6 py-2"
        }`}
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
