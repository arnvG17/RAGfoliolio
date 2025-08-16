import { ArrowUpRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import "./Metal.css";
import CircularText from "./CircularText";

const HeroSection = () => {
  const greetingRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const headlineRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const socialRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const circularTextRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 items-start">
        {/* --- LEFT COLUMN --- */}
        <div className="flex flex-col text-left h-full">
          {/* Greeting */}
          <div
            ref={greetingRef.ref}
            className={`flex items-center gap-2 mb-8 transition-all duration-1000 ${
              greetingRef.isVisible
                ? "animate-pop-in"
                : "opacity-0 scale-90 translate-y-8 blur-sm"
            }`}
          >
            <span className="text-xl"> `</span>
            <span className="text-muted-foreground text-lg">  </span>
          </div>

          {/* Main Headline */}
          <div
            ref={headlineRef.ref}
            className={`mb-12 transition-all duration-1000 ${
              headlineRef.isVisible
                ? "animate-fade-in-scale"
                : "opacity-0 scale-95 blur-md"
            }`}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Crafting </span>
              <span className="text-accent">purpose driven</span>
              <br />
              <span className="text-accent">experiences </span>
              <span className="text-foreground">that inspire</span>
              <br />
              <span className="text-foreground">& engage.</span>
            </h1>
          </div>

          {/* Social Links */}
          <div
            ref={socialRef.ref}
            className={`flex flex-wrap items-center gap-6 mt-auto transition-all duration-1000 ${
              socialRef.isVisible
                ? "animate-slide-in-left"
                : "opacity-0 -translate-x-8 blur-sm"
            }`}
          >
            <a
              href="https://www.linkedin.com/in/arnav-gawandi-2ba6b1324/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
            >
              LINKEDIN <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/arnV17"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
            >
              GITHUB <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://leetcode.com/u/ArnV17/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
            >
              INSTAGRAM <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="mailto:arnavog@gmail.com"
              className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
            >
              GMAIL <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Only Circular Text --- */}
        <div className="flex justify-center items-center relative h-full">
          <div
            ref={circularTextRef.ref}
            className={`transition-all duration-1000 ${
              circularTextRef.isVisible
                ? "animate-fade-in-scale"
                : "opacity-0 scale-95 blur-md"
            }`}
          >
            <CircularText
              text="ARNAV⚛GAWANDI⚛"
              onHover="goBonkers"
              spinDuration={6}
              className="w-64 h-64"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
