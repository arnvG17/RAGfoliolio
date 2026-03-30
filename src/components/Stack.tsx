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
    <section id="stack" className="w-full h-full relative overflow-hidden">

      {/* Section Header — overlaid at top */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-center gap-2 pointer-events-none">
        <span className="text-accent">✦</span>
        <span className="text-accent font-medium text-sm tracking-wider uppercase">
          My Stack
        </span>
      </div>

      {/* StackFlow fills the entire panel */}
      <div className="w-full h-full">
        <StackFlow />
      </div>

    </section>
  );
};

export default Stack;