import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">Get In Touch</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Let's create something</span>
            <br />
            <span className="text-accent">amazing together</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Ready to bring your vision to life? I'm here to help create exceptional digital experiences 
            that drive results and exceed expectations.
          </p>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button 
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-base font-medium rounded-full"
          >
            <a href="mailto:devrajchatribin9978@gmail.com">
              Start a Project <ArrowUpRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="border-accent/20 text-accent hover:bg-accent/10 hover:border-accent/40 px-8 py-3 text-base font-medium rounded-full"
          >
            <a href="https://www.linkedin.com/in/devraj-chatribin/" target="_blank" rel="noopener noreferrer">
              Let's Connect <ArrowUpRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>

        {/* Contact Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <a 
            href="https://www.linkedin.com/in/devraj-chatribin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
          >
            LinkedIn ↗
          </a>
          <a 
            href="https://github.com/DevrajDC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
          >
            GitHub ↗
          </a>
          <a 
            href="https://www.instagram.com/devraj_uiux/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
          >
            Instagram ↗
          </a>
          <a 
            href="mailto:devrajchatribin9978@gmail.com"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
          >
            Email ↗
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;