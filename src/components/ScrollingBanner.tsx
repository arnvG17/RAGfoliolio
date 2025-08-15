const ScrollingBanner = () => {
  const skills = [
    "AI","Websites", "Design", "Graphics", "Animations", "AI", "Marketing"
  ];

  // Duplicate the array to create seamless infinite scroll
  const duplicatedSkills = [...skills, ...skills];

  return (
    <div className="w-full overflow-hidden py-12 border-y border-border/30">
      <div className="flex animate-scroll-left whitespace-nowrap">
        {duplicatedSkills.map((skill, index) => (
          <div key={index} className="flex items-center">
            <span className="text-2xl md:text-4xl font-light text-muted-foreground mx-8">
              {skill}
            </span>
            <span className="text-accent text-xl mx-8">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;