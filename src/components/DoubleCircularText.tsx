/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { motion } from "framer-motion";
import React from "react";
import "./Metal.css";

interface DoubleCircularTextProps {
  text: string;
  radius?: number;
  innerScale?: number; // scale factor for inner ring
  outerScale?: number; // scale factor for outer ring
  className?: string;
}

const DoubleCircularText: React.FC<DoubleCircularTextProps> = ({
  text,
  radius = 100,
  innerScale = 0.75,
  outerScale = 1.25,
  className = "",
}) => {
  const letters: string[] = text.split("");
  const step = (2 * Math.PI) / letters.length;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
    >
      {/* Outer ring */}
      <div
        className="absolute"
        style={{ width: radius * 2 * outerScale, height: radius * 2 * outerScale }}
      >
        {letters.map((letter: string, i: number) => {
          const angle = i * step;
          const x = radius * outerScale * Math.cos(angle);
          const y = radius * outerScale * Math.sin(angle);

          return (
            <span
              key={`outer-${i}`}
              className="absolute text-white font-medium"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${angle}rad)`,
                transformOrigin: "center",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Inner ring */}
      <div
        className="absolute"
        style={{ width: radius * 2 * innerScale, height: radius * 2 * innerScale }}
      >
        {letters.map((letter: string, i: number) => {
          const angle = i * step;
          const x = radius * innerScale * Math.cos(angle);
          const y = radius * innerScale * Math.sin(angle);

          return (
            <span
              key={`inner-${i}`}
              className="absolute text-gray-400 font-medium"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${angle}rad)`,
                transformOrigin: "center",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DoubleCircularText;
