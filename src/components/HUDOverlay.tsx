'use client';

import { useState, useEffect } from 'react';

interface HUDOverlayProps {
  startEntry: boolean;
  scrollProgress: number;
  activeSection: number;
}

export function HUDOverlay({ startEntry, scrollProgress, activeSection }: HUDOverlayProps) {
  const sections = ['HOME', 'PROTOTYPES', 'SERVICES', 'CONTACT'];
  
  const targetWord = ['S', 'Y', 'N', 'E', 'X'];
  const [entered, setEntered] = useState<boolean[]>([false, false, false, false, false]);
  const [animProgress, setAnimProgress] = useState(0);
  const [boxStage, setBoxStage] = useState(0);

  // Stagger letters fade-in slide-down
  useEffect(() => {
    if (!startEntry) {
      setEntered([false, false, false, false, false]);
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    targetWord.forEach((_, idx) => {
      // Stagger sequential fade-in slide down from top (200ms gap per letter)
      const delay = idx * 200;
      const timeout = setTimeout(() => {
        setEntered((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [startEntry]);

  // Connected dots navigation vertical line trunk & branches drawing progress
  useEffect(() => {
    if (!startEntry) {
      setAnimProgress(0);
      return;
    }

    let startTime = Date.now();
    const duration = 2200; // 2.2 seconds total animation time for right sidebar layout

    let animId: number;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress * 3); // Map progress [0, 1] to segment steps [0, 3]

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      }
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [startEntry]);

  // Description Box diagonal entry animation stages
  useEffect(() => {
    if (!startEntry) {
      setBoxStage(0);
      return;
    }

    const t1 = setTimeout(() => setBoxStage(1), 600);
    const t2 = setTimeout(() => setBoxStage(2), 1100);
    const t3 = setTimeout(() => setBoxStage(3), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [startEntry]);

  // Calculate which section is active based on scroll progress (0.0 to 1.0 mapped to 4 sections)
  const activeIndex = Math.min(3, Math.floor(scrollProgress * 4));

  // Handler to scroll smoothly to the targeted section progress position
  const handleNavClick = (idx: number) => {
    if (typeof window === 'undefined') return;
    const progress = idx / 3; // map 0-3 index to 0.0-1.0 progress
    const targetScroll = progress * 4 * window.innerHeight; // 400vh is the sequence length
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div className="absolute inset-0 w-full h-screen pointer-events-none z-20 select-none">
      {/* The Vertical Title "SYNEX" with premium stagger fade-in entry animation */}
      <div className="absolute top-1/2 -translate-y-1/2 left-16 md:left-28 lg:left-40">
        <div className="relative flex flex-col gap-0.5 md:gap-1 font-sans font-black text-[12vh] md:text-[15vh] lg:text-[19vh] leading-[0.82] tracking-tighter uppercase text-zinc-200 select-none">
          {targetWord.map((char, idx) => (
            <span 
              key={idx}
              className="inline-block origin-top text-center"
              style={{
                transition: 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: entered[idx] ? 0.75 : 0,
                transform: entered[idx] ? 'translateY(0)' : 'translateY(-20px)',
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Connected Dots Navigation on the Right Side */}
      <div className="absolute right-8 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 flex flex-col items-end relative py-4 z-30 pointer-events-auto">
        
        {sections.map((label, idx) => {
          const isActive = activeIndex === idx;
          const isDotRevealed = animProgress >= idx;
          const hasBranched = animProgress >= idx;

          return (
            <div 
              key={label} 
              onClick={() => handleNavClick(idx)}
              className="flex items-center justify-end relative select-none cursor-pointer group h-10"
            >
              {/* Label and Expanding Horizontal Line */}
              <div 
                className={`flex items-center transition-all duration-700 ease-out origin-right ${
                  isActive 
                    ? 'opacity-100 translate-x-0' 
                    : hasBranched
                      ? 'opacity-45 group-hover:opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-2'
                }`}
              >
                {/* Active Section Label */}
                <span className={`text-[9px] tracking-[0.25em] font-mono font-bold mr-3 transition-colors duration-500 ${
                  isActive ? 'text-accent font-black' : 'text-zinc-300 group-hover:text-white'
                }`}>
                  {label}
                </span>
                
                {/* Horizontal Connected Line (expands horizontally towards left, active or group-hovered, colored green) */}
                <span 
                  className={`h-[1px] -mr-1 bg-accent ${
                    isActive && hasBranched
                      ? 'w-10 md:w-16' 
                      : hasBranched
                        ? 'w-0 group-hover:w-6 md:group-hover:w-10'
                        : 'w-0'
                  }`}
                  style={{
                    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* The Nav Dot Container (holds the dot and the vertical lines for subpixel alignment) */}
              <div className="relative z-10 flex items-center justify-center w-2 h-2">
                
                {/* The Nav Dot */}
                <div 
                  className={`w-2 h-2 rounded-full border transition-all duration-500 ${
                    isActive 
                      ? 'bg-accent border-accent scale-125 shadow-[0_0_8px_rgba(163,230,53,0.8)]' 
                      : isDotRevealed
                        ? 'bg-white/10 border-white/30 group-hover:border-white/60 group-hover:scale-110 opacity-100 scale-100'
                        : 'bg-white/5 border-white/10 opacity-0 scale-0'
                  }`}
                />

                {/* Vertical connector guide track to the next dot (Centered horizontally, starts at bottom of dot, 32px height) */}
                {idx < sections.length - 1 && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-[1px] h-[32px] bg-white/10 pointer-events-none z-[-1]" 
                    style={{ top: '8px' }}
                  />
                )}

                {/* Vertical connector line segment to the next dot (growing trunk, Centered horizontally, starts at bottom of dot, colored white/35) */}
                {idx < sections.length - 1 && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-[1px] h-[32px] pointer-events-none z-[-1] bg-transparent"
                    style={{ top: '8px' }}
                  >
                    <div 
                      className="w-full bg-white/35 origin-top"
                      style={{
                        height: `${Math.max(0, Math.min(100, (animProgress - idx) * 100))}%`,
                        transition: 'height 0.05s linear'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Glassmorphic Container with Sharp Edges & 6-sided SIM-card Cut - Bottom Right */}
      <div 
        className={`absolute bottom-8 right-8 md:bottom-12 md:right-12 lg:bottom-16 lg:right-16 pointer-events-auto z-30 select-none rounded-none shadow-2xl group flex items-stretch gap-4 ${
          boxStage < 2
            ? 'w-4 h-4'
            : 'w-[320px] md:w-[384px] h-[148px] md:h-[168px]'
        }`}
        style={{
          opacity: boxStage === 0 ? 0 : 1,
          overflow: boxStage < 3 ? 'hidden' : 'visible',
          backgroundColor: boxStage < 2 ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0.1)',
          border: boxStage < 2 ? '1px solid rgba(255, 255, 255, 0)' : '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: boxStage < 2 ? 'blur(0px)' : 'blur(12px)',
          clipPath: boxStage < 2
            ? 'polygon(0px 0, 100% 0, 100% 100%, 100% 100%, 0 100%, 0 0)'
            : 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)',
          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.8s ease, border-color 0.8s ease',
        }}
      >
        {/* Inner solid background backplate */}
        <div 
          className="absolute inset-[1px] bg-zinc-950/70 z-[-1] transition-all duration-800"
          style={{
            clipPath: boxStage < 2 
              ? 'polygon(0px 0, 100% 0, 100% 100%, 100% 100%, 0 100%, 0 0)' 
              : 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)',
            opacity: boxStage < 2 ? 0 : 1,
          }}
        />

        {/* Futuristic Tech Corner Brackets on the un-clipped corners (Top-Right and Bottom-Left) */}
        <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-accent z-10" />
        <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-accent z-10" />
        
        {/* Left Side: Helmet Profile Image (consumes all vertical space, top-left is naturally clipped) */}
        <div 
          className="w-28 md:w-36 bg-zinc-950/50 border-r border-white/10 overflow-hidden flex-shrink-0 relative transition-opacity duration-500 ease-out"
          style={{
            opacity: boxStage === 3 ? 0.85 : 0,
            pointerEvents: boxStage === 3 ? 'auto' : 'none',
          }}
        >
          <img 
            src="/img/helmet_mask.png" 
            alt="SYNEX Mask Profile" 
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Right Side: Monospaced Tech Terminal Log (padded vertically and right) */}
        <div 
          className="flex flex-col justify-between font-mono text-[9px] md:text-[10px] text-zinc-400 leading-relaxed tracking-wider py-4 pr-4 transition-opacity duration-500 ease-out"
          style={{
            opacity: boxStage === 3 ? 1 : 0,
            pointerEvents: boxStage === 3 ? 'auto' : 'none',
          }}
        >
          <div className="flex items-center gap-1.5 font-bold text-accent mb-1.5">
            <span className="w-1.5 h-1.5 bg-accent animate-pulse rounded-full" />
            <span>SYS // SYNEX_OVERVIEW</span>
          </div>
          <div className="space-y-0.5 text-zinc-100">
            <div><span className="text-zinc-400 font-bold">[MODEL]</span> &nbsp;&nbsp;<span className="text-white">SYNEX_V1.00</span></div>
            <div><span className="text-zinc-400 font-bold">[TYPE]</span> &nbsp;&nbsp;<span className="text-white">ORNAMENTAL_EXO</span></div>
            <div><span className="text-zinc-400 font-bold">[PURPOSE]</span> <span className="text-white">SHOWCASING_UI_UX</span></div>
            <div><span className="text-zinc-400 font-bold">[CREATOR]</span> <span className="text-white">RIJURAJ [DEV]</span></div>
            <div><span className="text-zinc-400 font-bold">[CLASS]</span> &nbsp;&nbsp;<span className="text-white">HOBBY_BUILD</span></div>
          </div>
          <div className="mt-2.5 text-[8px] text-zinc-600 border-t border-white/5 pt-1.5 flex justify-between gap-4">
            <span className="text-accent/60">STATUS: NOMINAL</span>
            <span className="text-zinc-500">© 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HUDOverlay;
