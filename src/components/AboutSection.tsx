import { useEffect, useRef } from "react";
import BlobCursor from "./BlobCursor";

const AboutSection = () => {
  const blobRef = useRef(null);

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
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              About Me
            </span>
          </div>
        </div>

        {/* About Content */}
        <div className="text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-muted-foreground">
            I'm{" "}
            <span className="text-foreground font-medium">Arnav Gawandi</span>,
            with over{" "}
            <span className="text-accent font-medium">5+ years</span> of
            experience in design & development with strong focus on producing{" "}
            <span className="text-foreground font-medium">
              high quality & impactful digital experiences
            </span>
            . I have worked with some of the most innovative industry leaders to
            help build their{" "}
            <span className="text-accent font-medium">top-notch products</span>.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-accent mb-2">5+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider">
              Years Experience
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-accent mb-2">50+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider">
              Projects Completed
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider">
              Client Satisfaction
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
