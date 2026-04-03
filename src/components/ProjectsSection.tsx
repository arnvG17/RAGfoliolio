import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

const ProjectsSection = () => {

  const projects = [
    {
      title: "Lakeside-Podcasting App",
      category: "Podcasting App",
      year: "2026",
      description:
        "A Video Conference and Recording app for Podcasters and Educators, with cloud-storage and real-time transcriptions",
      image: "/Screenshot 2026-01-18 214311.png",
      link: "https://lakeside-beta.vercel.app/",
    },
    {
      title: "The Noting App",
      category: "AI Integration",
      year: "2025",
      description:
        "AI-Based Notes summarizer with Inbuilt RAG chatbot and Quiz",
      image: "/Screenshot 2025-12-24 183856.png",
      link: "https://thenotingapp.vercel.app/",
    },
    {
      title: "Konkanai AgroTourism",
      category: "Digital Brochure",
      year: "2025",
      description:
        "A Work in progress Digital brochure for an AgroTourism Agency",
      image: "/Screenshot 2025-08-16 160445.png",
      link: "https://konkanai-ccyn.vercel.app/",
    },
    {
      title: "Pokedex",
      category: "Full Stack Project, API",
      year: "2024",
      description:
        "PokeAPI based Pokedex using react and node with caching",
      image: "/Screenshot 2025-08-16 160212.png",
      link: "https://pokedb-sj8s.vercel.app/",
    },

    {
      title: "Recursion",
      category: "Portfolio",
      year: "2025",
      description: " ",
      image: "/Screenshot 2025-12-24 183856.png",
      link: "https://thenotingapp.vercel.app/",
    },
  ];

  return (
    <section id="projects" className="relative pt-20 pb-4 px-6 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-2 mb-16">
          <span className="text-accent">✦</span>
          <span className="text-accent font-semibold text-sm tracking-[0.3em] uppercase">
            My Projects
          </span>
        </div>


        {/* Projects Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project, index) => (
            <Card
              key={index}
              className="bg-card/50 border-border/30 overflow-hidden"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
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
                <h3 className="text-xl font-semibold mb-3">
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
                  className="text-accent px-3 py-1 rounded-full font-light tracking-tight"
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
