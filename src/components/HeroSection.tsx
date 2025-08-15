import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-6xl mx-auto text-center">
        {/* Greeting */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <span className="text-xl">👋</span>
          <span className="text-muted-foreground text-lg">Hey! It's me Devraj,</span>
        </div>

        {/* Main Headline */}
        <div className="mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            <span className="text-foreground">Crafting </span>
            <span className="text-accent">purpose driven</span>
            <br />
            <span className="text-accent">experiences </span>
            <span className="text-foreground">that inspire</span>
            <br />
            <span className="text-foreground">& engage.</span>
          </h1>
        </div>

        {/* Description */}
        <div className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
          <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            I work with brands globally to build pixel-perfect, engaging, and accessible digital 
            experiences that drive results and achieve business goals.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s' }}>
          <a 
            href="https://www.linkedin.com/in/devraj-chatribin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
          >
            LINKEDIN <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href="https://github.com/DevrajDC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
          >
            GITHUB <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href="https://www.instagram.com/devraj_uiux/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
          >
            INSTAGRAM <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href="mailto:devrajchatribin9978@gmail.com"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
          >
            GMAIL <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '1s' }}>
          <Button 
            onClick={() => scrollToSection('about')}
            variant="outline"
            size="lg"
            className="border-accent/20 text-accent hover:bg-accent/10 hover:border-accent/40 px-8 py-3 text-base font-medium rounded-full"
          >
            Know me better
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;