import { useEffect, useRef } from "react";
import FlowingMenu from "./FlowingMenu2";

const Stack = () => {
    const demoItems = [
        { link: '#', text: 'React', image: 'https://picsum.photos/600/400?random=1' },
        { link: '#', text: 'Express', image: 'https://picsum.photos/600/400?random=2' },
        { link: '#', text: 'Node.js', image: 'https://picsum.photos/600/400?random=3' },
        { link: '#', text: 'MongoDB', image: 'https://picsum.photos/600/400?random=4' }
      ];
  

  

  return (
    <section id="about" className="py-20 px-6 relative overflow-hidden">
      

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              About Me
            </span>
          </div>
          <div>
            <FlowingMenu items={demoItems} />
          </div>
        </div>

        

        
      </div>
    </section>
  );
};

export default Stack;
