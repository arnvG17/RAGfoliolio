const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">About Me</span>
          </div>
        </div>

        {/* About Content */}
        <div className="text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-muted-foreground">
            I'm <span className="text-foreground font-medium">Arnav Gawandi</span>, with over{" "}
            <span className="text-accent font-medium">5+ years</span> of experience in design & development 
            with strong focus on producing{" "}
            <span className="text-foreground font-medium">high quality & impactful digital experiences</span>. 
            I have worked with some of the most innovative industry leaders to help build their{" "}
            <span className="text-accent font-medium">top-notch products</span>.
          </p>
        </div>

        {/* Stats or additional info could go here */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-accent mb-2">5+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider">Years Experience</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-accent mb-2">50+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider">Projects Completed</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;