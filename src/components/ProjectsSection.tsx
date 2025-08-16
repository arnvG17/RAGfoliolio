import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const ProjectsSection = () => {
  const headerRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const projectsRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const projects = [
    {
      title: "The Noting App",
      category: "AI Integration",
      year: "2025",
      description:
        "AI-Based Notes summarizer with Inbuilt RAG chatbot and Quiz",
      image:
        "https://drive.google.com/uc?export=view&id=154GIWbEfwhWoXfjNPYXufDQitU2Z39Xl", // fixed drive link
      link: "https://the-noting-pap.vercel.app/",
    },
    {
      title: "Pokedex",
      category: "Full Stack Project, API",
      year: "2024",
      description:
        "PokeAPI based Pokedex using react and node with caching",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop&crop=center",
      link: "https://pokedb-sj8s.vercel.app/",
    },
    {
      title: "Konkanai AgroTourism",
      category: "Digital Brochure",
      year: "2025",
      description:
        "A Work in progress Digital brochure for an AgroTourism Agency",
      image:
        "https://images.unsplash.com/photo-1558655146-9f40138c9db3?w=600&h=400&fit=crop&crop=center",
      link: "https://konkanai-ccyn.vercel.app/",
    },
  ];

  return (
    <section id="projects" className="relative py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef.ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerRef.isVisible
              ? "animate-pop-in"
              : "opacity-0 scale-90 translate-y-8 blur-sm"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              My Work
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Selected</span>
            <span className="text-accent">Projects</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Here's a curated selection showcasing my expertise and the achieved
            results.
          </p>
        </div>

        {/* Projects Grid */}
        <div
          ref={projectsRef.ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${
            projectsRef.isVisible
              ? "animate-fade-in-scale"
              : "opacity-0 scale-95 blur-md"
          }`}
        >
          {projects.map((project, index) => (
            <Card
              key={index}
              className="group bg-card/50 border-border/30 hover:border-accent/30 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-accent text-sm font-medium">
                    {project.category}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {project.year}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* View Project Button with Link */}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-accent hover:text-accent hover:bg-accent/10 px-3 py-1 rounded-full font-medium"
                >
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    View Project <ArrowUpRight className="w-4 h-4 ml-1 inline" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
