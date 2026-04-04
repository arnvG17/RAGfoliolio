import { Github, Code, Mail } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import ZenitsuAnimation from "./ZenitsuAnimation";
import { FlowButton } from "@/components/ui/flow-button";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ContactSection = () => {
  const headerRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const actionsRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const linksRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.4 });
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: "#contact",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }, []);

  return (
    <section id="contact" className="relative min-h-[85vh] flex items-center bg-black overflow-hidden py-24 md:py-48">
      {/* Zenitsu Animation - Fixed to Left Side */}
      <ZenitsuAnimation />

      <div className="container relative z-10 mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
        {/* Left Side: Empty spacing for desktop to balance the animation */}
        <div className="hidden md:block h-full pointer-events-none" />

        {/* Right Side: High-End Contact Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-3xl">
          {/* Section Header */}
          <div
            ref={(el) => {
              // Combine refs
              (headerRef.ref.current as any) = el;
              (parallaxRef.current as any) = el;
            }}
            className={`mb-8 md:mb-12 transition-all duration-1000 ${headerRef.isVisible ? 'animate-pop-in' : 'opacity-0 scale-95 translate-y-12 blur-md'
              }`}
          >
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6 md:mb-8">
              <span className="text-accent">✦</span>
              <span className="text-accent font-semibold text-sm tracking-[0.3em] uppercase">
                Contact
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-[8vw] lg:text-[9vw] font-black mb-8 md:mb-12 tracking-[-0.04em] leading-[0.9] md:leading-[0.8]">
              <span className="text-white/95">Ready to</span>
              <br />
              <span className="text-accent">execute?</span>
            </h2>

            <p className="text-white/40 text-base md:text-xl font-light leading-relaxed mb-6 max-w-lg tracking-tight px-4 md:px-0">
              Elevate your digital presence with elite performance and cinematic design.
              Let's build the future together.
            </p>
          </div>

          {/* Contact Actions - Dual Capsule Layout */}
          <div
            ref={actionsRef.ref}
            className={`flex flex-col sm:flex-row items-center gap-4 md:gap-5 mb-8 md:mb-2 transition-all duration-1000 ${actionsRef.isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12 blur-md'
              }`}
          >
            <FlowButton 
              text="Lets connect"
              href="mailto:arnavog@gmail.com"
              variant="primary"
              className="w-full sm:w-auto px-10 md:px-14 py-5 md:py-6"
            />
            <FlowButton 
              text="LinkedIn"
              href="https://www.linkedin.com/in/arnav-gawandi17/"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              className="w-full sm:w-auto px-10 md:px-14 py-5 md:py-6 text-white/90 border-white/10"
            />
          </div>

          {/* Contact Links - Tightened Logic */}
          <div
            ref={linksRef.ref}
            className={`flex items-center justify-center md:justify-start gap-x-8 md:gap-x-10 transition-all duration-1000 delay-300 ${linksRef.isVisible ? 'animate-fade-in' : 'opacity-0 translate-y-4 blur-sm'
              }`}
          >
            {[
              { icon: Github, href: "https://github.com/arnvG17", label: "Github" },
              { icon: Code, href: "https://leetcode.com/u/ArnV17/", label: "Leetcode" },
              { icon: Mail, href: "mailto:arnavog@gmail.com", label: "Email" }
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                className="group relative flex flex-col items-center p-3 md:p-2"
              >
                <link.icon className="w-6 h-6 md:w-5 md:h-5 text-white/20 group-hover:text-accent transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]" />
                <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-accent transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Section Blending & Vignettes */}
      {/* Side Vignettes for Mobile ONLY */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-black via-black/40 to-transparent pointer-events-none md:hidden" />
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-black via-black/40 to-transparent pointer-events-none md:hidden" />
      
      {/* Original Desktop Right-side Vignette */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black via-black/40 to-transparent pointer-events-none hidden md:block" />
    </section>
  );
};



export default ContactSection;
