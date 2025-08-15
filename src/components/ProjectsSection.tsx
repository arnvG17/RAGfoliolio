import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

const ProjectsSection = () => {
  const projects = [
    {
      title: "Aora",
      category: "Development",
      year: "2024",
      description: "A modern mobile application built with React Native and cutting-edge technologies.",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center"
    },
    {
      title: "Code Screenshot",
      category: "Development & Design",
      year: "2024", 
      description: "Beautiful code screenshot generator with syntax highlighting and customizable themes.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop&crop=center"
    },
    {
      title: "UI Component Library",
      category: "Design System",
      year: "2023",
      description: "Comprehensive design system and component library for modern web applications.",
      image: "https://images.unsplash.com/photo-1558655146-9f40138c9db3?w=600&h=400&fit=crop&crop=center"
    }
  ];

  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">My Work</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Selected</span>
            <span className="text-accent">Projects</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Here's a curated selection showcasing my expertise and the achieved results.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="group bg-card/50 border-border/30 hover:border-accent/30 transition-all duration-300 overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-accent text-sm font-medium">{project.category}</span>
                  <span className="text-muted-foreground text-sm">{project.year}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-accent hover:text-accent hover:bg-accent/10 p-0 h-auto font-medium"
                >
                  View Project <ArrowUpRight className="w-4 h-4 ml-1" />
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