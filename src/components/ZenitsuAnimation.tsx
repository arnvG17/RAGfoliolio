import { useRef, useState, useEffect, useCallback } from "react";
import Noise from "./Noise";
import "./ZenitsuAnimation.css";

const VIDEO_PATH = "/zenitsu-thunder-breathing-first-form-thunderclap-and-flash-4k-ultra-hd-2160-ytshorts.savetube.me.mp4";

const ZenitsuAnimation = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(err => console.log("Auto-play blocked:", err));
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      if (wrapperRef.current) observer.unobserve(wrapperRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="zenitsu-frame-wrapper">
      {/* Holistic Masking Container */}
      <div ref={innerRef} className="zenitsu-frame-inner">
        <video
          ref={videoRef}
          src={VIDEO_PATH}
          className="zenitsu-frame-video"
          muted
          loop
          playsInline
          preload="auto"
          onLoadedMetadata={() => setIsLoaded(true)}
        />
        
        {/* Cinematic Overlays */}
        <div className="zenitsu-mask-overlay" />
        <div className="zenitsu-grain-overlay-container">
          <Noise patternAlpha={50} patternRefreshInterval={3} />
        </div>
        <div className="zenitsu-vignette" />
      </div>

      {!isLoaded && (
        <div className="zenitsu-frame-loader">
          <div className="zenitsu-frame-loader-inner">
            <div className="zenitsu-frame-spinner" />
            <div className="zenitsu-frame-loader-bar">
              <div className="zenitsu-frame-loader-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="zenitsu-frame-loader-text">INITIALIZING HD VIDEO</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZenitsuAnimation;
