'use client';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FlowButtonProps {
  text?: string;
  href?: string;
  download?: string;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
  target?: string;
  rel?: string;
}

export function FlowButton({ 
  text = "Modern Button", 
  href, 
  download, 
  onClick, 
  className,
  variant = 'primary',
  target,
  rel
}: FlowButtonProps) {
  const isLink = !!href;
  
  const content = (
    <>
      {/* Left arrow (appears on hover) */}
      <ArrowRight 
        className="absolute w-4 h-4 left-[-30%] stroke-current z-[10] group-hover:left-5 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-0 group-hover:translate-x-5 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] text-white group-hover:text-black">
        {text}
      </span>

      {/* Expanding Background Circle */}
      <span className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full opacity-0",
        "group-hover:w-[450px] group-hover:h-[450px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
        variant === 'primary' ? "bg-accent" : "bg-white"
      )}></span>

      {/* Right arrow (disappears on hover) */}
      <ArrowRight 
        className="absolute w-5 h-5 right-6 stroke-white group-hover:stroke-black z-[10] group-hover:right-[-30%] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]" 
      />
    </>
  );

  const baseStyles = cn(
    "group relative flex items-center justify-center overflow-hidden rounded-full border-[1.5px] px-14 py-7 text-base font-bold tracking-tight cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
    "active:scale-95",
    "bg-transparent border-white/20 hover:border-transparent",
    className
  );

  if (isLink) {
    return (
      <a href={href} download={download} target={target} rel={rel} className={baseStyles}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseStyles}>
      {content}
    </button>
  );
}
