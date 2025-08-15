import { useEffect, useRef } from "react";
import BlobCursor from "./BlobCursor";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const AboutSection = () => {
  const blobRef = useRef(null);
  const headerRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const contentRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (blobRef.current) {
        // Get About section boundaries
        const aboutSection = document.getElementById("about");
        const rect = aboutSection.getBoundingClientRect();

        // Only move blob if cursor is inside About section
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          blobRef.current.style.left = `${e.clientX}px`;
          blobRef.current.style.top = `${e.clientY}px`;
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section id="about" className="py-20 px-6 relative overflow-hidden">
      {/* Blob stays in About section */}
      <div
        ref={blobRef}
        className="absolute pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <BlobCursor
         blobType="circle"
         fillColor="#5227FF"
         trailCount={5}
         sizes={[60, 125, 75]}
         innerSizes={[20, 35, 25]}
         innerColor="rgba(8, 253, 81, 0.8)"
         opacities={[0.6, 0.6, 0.6]}
         shadowColor="rgba(0,0,0,0.75)"
         shadowBlur={5}
         shadowOffsetX={10}
         shadowOffsetY={10}
         filterStdDeviation={30}
         useFilter={true}
         fastDuration={0.1}
         slowDuration={0.5}
         zIndex={100} />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={headerRef.ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerRef.isVisible ? 'animate-pop-in' : 'opacity-0 scale-90 translate-y-8 blur-sm'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              About Me
            </span>
          </div>
        </div>

        {/* About Content */}
        <div 
          ref={contentRef.ref}
          className={`text-center transition-all duration-1000 ${
            contentRef.isVisible ? 'animate-fade-in-scale' : 'opacity-0 scale-95 blur-md'
          }`}
        >
        <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-muted-foreground">
  I'm{" "}
  <span className="text-foreground font-medium">Arnav Gawandi</span>, a{" "}
  <span className="text-accent font-medium">web designer</span> who approaches
  every project as if crafting a{" "}
  <span className="text-foreground font-medium">bespoke home</span>. I immerse
  myself in your vision, shaping every{" "}
  <span className="text-accent font-medium">layout, interaction, and detail</span>{" "}
  with care and intention. My goal is to create digital spaces that are{" "}
  <span className="text-foreground font-medium">visually striking</span> yet{" "}
  <span className="text-accent font-medium">personal, functional, and welcoming</span>, 
  a place where your <span className="text-foreground font-medium">brand truly lives </span> 
   and connects with its audience.
</p>
        </div>

        
      </div>
    </section>
  );
};

export default AboutSection;
