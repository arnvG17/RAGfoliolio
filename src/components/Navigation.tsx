import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" }
  ];

  return (
    <>
      <nav
        className={`fixed top-6 z-[100] transition-all duration-700 ease-[cubic-bezier(0.2, 0.8, 0.2, 1)]
          backdrop-blur-xl border rounded-full 
          flex items-center justify-between py-3 px-6 md:px-8
          left-1/2 -translate-x-1/2
          ${isFullWidth 
            ? "w-[92%] md:w-[94%] max-w-[1400px] bg-background/80 border-white/20 shadow-2xl py-4" 
            : "w-[92%] md:w-[600px] bg-background/40 border-white/10 shadow-lg"}`}
        style={{ 
          // Match desktop behavior but disable offset on mobile
          left: isFullWidth ? '50%' : (typeof window !== 'undefined' && window.innerWidth > 900 ? 'calc(30% + 20px)' : '50%') 
        }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2 text-xl font-bold text-accent cursor-pointer" onClick={() => scrollToSection("home")}>
          <span className="text-2xl">⚛</span> <span className="tracking-tighter">Arnv</span>
        </div>

        {/* Desktop Links */}
        <div className={`hidden md:flex items-center transition-all duration-700 ${isFullWidth ? "space-x-8" : "space-x-6"}`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`transition-all duration-300 text-sm font-medium hover:text-accent relative group
                ${activeSection === link.id ? "text-accent" : "text-foreground/70"}`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full ${activeSection === link.id ? "w-full" : ""}`} />
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden md:flex rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-6"
          >
            <a href="/Arnav_Gawandi_Resume.pdf" download>Resume</a>
          </Button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[90] md:hidden bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center pt-20"
          >
            <div className="flex flex-col items-center gap-8 w-full px-12">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-3xl font-bold tracking-tight transition-colors
                    ${activeSection === link.id ? "text-accent" : "text-foreground/50"}`}
                >
                  {link.label}
                </button>
              ))}
              <div className="h-px w-full bg-white/10 mt-4" />
              <Button
                asChild
                className="w-full h-14 rounded-2xl text-lg bg-accent text-accent-foreground"
              >
                <a href="/Arnav_Gawandi_Resume.pdf" download onClick={() => setIsMenuOpen(false)}>
                  Download Resume
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
