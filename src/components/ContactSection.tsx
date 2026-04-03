import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import ZenitsuAnimation from "./ZenitsuAnimation";

const ContactSection = () => {
  const headerRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const actionsRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const linksRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.4 });

  return (
    <section id="contact" className="relative min-h-[75vh] flex items-center bg-black overflow-hidden py-24">
      {/* Zenitsu Animation - Fixed to Left Side */}
      <ZenitsuAnimation />
      
      <div className="container relative z-10 mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* Left Side: Empty spacing for desktop to balance the animation */}
        <div className="hidden md:block h-full pointer-events-none" />

        {/* Right Side: High-End Contact Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-3xl">
          {/* Section Header */}
          <div
            ref={headerRef.ref}
            className={`mb-16 transition-all duration-1000 ${headerRef.isVisible ? 'animate-pop-in' : 'opacity-0 scale-95 translate-y-12 blur-md'
              }`}
          >
            <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
              <span className="text-accent">✦</span>
              <span className="text-accent font-semibold text-sm tracking-[0.3em] uppercase">
                Contact
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tighter leading-[0.85]">
              <span className="text-white/95">Ready to</span>
              <br />
              <span className="text-accent">Execute?</span>
            </h2>

            <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-4 max-w-xl">
              Elevate your digital presence with elite performance and cinematic design. 
              Let's build the future together.
            </p>
          </div>

          {/* Contact Actions */}
          <div
            ref={actionsRef.ref}
            className={`flex flex-col sm:flex-row items-center gap-4 mb-16 transition-all duration-1000 ${actionsRef.isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12 blur-md'
              }`}
          >
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-lg font-light rounded-full shadow-[0_0_40px_rgba(225,29,72,0.4)] transition-all hover:scale-105 active:scale-95 tracking-tight"
            >
              <a href="mailto:arnavog@gmail.com">
                Project launch <ArrowUpRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/10 text-white/90 hover:bg-white/5 hover:border-white/30 px-10 py-6 text-lg font-light rounded-full backdrop-blur-3xl transition-all hover:scale-105 active:scale-95 tracking-tight"
            >
              <a href="https://www.linkedin.com/in/arnav-gawandi17/" target="_blank" rel="noopener noreferrer">
                LinkedIn <ArrowUpRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
  
          {/* Contact Links */}
          <div
            ref={linksRef.ref}
            className={`flex flex-wrap items-center justify-center md:justify-start gap-x-14 gap-y-8 transition-all duration-1000 ${linksRef.isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-12 blur-md'
              }`}
          >
            {[
              { label: "Github", href: "https://github.com/arnvG17" },
              { label: "Leetcode", href: "https://leetcode.com/u/ArnV17/" },
              { label: "Email", href: "mailto:arnavog@gmail.com" }
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col pt-3"
              >
                <span className="text-white/40 group-hover:text-accent transition-all duration-500 text-sm font-mono tracking-[0.3em] uppercase">
                  {link.label}
                </span>
                <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent transition-all duration-700 ease-in-out group-hover:w-full shadow-[0_0_20px_rgba(225,29,72,0.8)]" />
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section Blending & Vignettes */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black via-black/40 to-transparent pointer-events-none" />
    </section>
  );
};



export default ContactSection;