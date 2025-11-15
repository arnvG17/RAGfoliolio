import { useEffect, useRef } from "react";
import FlowingMenu from "./FlowingMenu2";
import MagicBento from "./MagicBento"
import StackFlow from "./StackFlow"


const Stack = () => {
    const demoItems = [
        { link: '#', text: 'React', image: 'https://picsum.photos/600/400?random=1' },
        { link: '#', text: 'Express', image: 'https://picsum.photos/600/400?random=2' },
        { link: '#', text: 'Node.js', image: 'https://picsum.photos/600/400?random=3' },
        { link: '#', text: 'MongoDB', image: 'https://picsum.photos/600/400?random=4' }
      ];

  return (
    <section id="about" className="py-20 px-6 relative overflow-hidden">
      
      {/* Noise component positioned as the background */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        
      </div>

      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              My Stack
            </span>
          </div>
          <div>
            <StackFlow />
            
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Stack;