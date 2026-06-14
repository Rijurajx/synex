'use client';

import { useState, useEffect } from 'react';

interface ScrambledTextProps {
  text: string;
  active: boolean;
  delay?: number;
  duration?: number;
}

function ScrambledText({ text, active, delay = 0, duration = 600 }: ScrambledTextProps) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'XYZ//0123456789_+=?*&%$#@![]{}<>/\\';

  useEffect(() => {
    if (!active) {
      setDisplayText('');
      return;
    }

    const startTimeout = setTimeout(() => {
      let startTime = Date.now();
      let timer: number;

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        const nextText = text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return char;
            const isResolved = progress > (idx / text.length) * 0.8;
            if (isResolved) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        setDisplayText(nextText);

        if (progress < 1) {
          timer = requestAnimationFrame(tick);
        } else {
          setDisplayText(text);
        }
      };

      timer = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(timer);
      };
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, active, delay, duration]);

  if (!active) {
    return <span className="opacity-0">{text}</span>;
  }

  return <span>{displayText}</span>;
}

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

  const [telemetry, setTelemetry] = useState({
    sync: 98.42,
    temp: 34.8,
    delay: 0.08,
    reg: '0x7FFF9821'
  });

  const [topRightStage, setTopRightStage] = useState(0);
  const [resolution, setResolution] = useState({ w: 1920, h: 1080 });

  // Trigger top-right telemetry panel entry stage animations
  useEffect(() => {
    if (!startEntry) {
      setTopRightStage(0);
      return;
    }

    const t1 = setTimeout(() => setTopRightStage(1), 300); // Stage 1: Draw horizontal lines
    const t2 = setTimeout(() => setTopRightStage(2), 700); // Stage 2: Draw vertical scales & background
    const t3 = setTimeout(() => setTopRightStage(3), 1200); // Stage 3: Activate telemetry contents

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [startEntry]);

  // Track window resolution for layout and live metrics calculations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setResolution({ w: window.innerWidth, h: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time calculations derived from actual scroll progress
  const frameIndex = activeSection === 0 
    ? Math.min(179, Math.max(0, Math.round(Math.min(1, scrollProgress / 0.85) * 179))) 
    : 0;

  const scrollPixelY = activeSection === 0 
    ? Math.round(scrollProgress * 4 * resolution.h)
    : Math.round((activeSection + 3) * resolution.h);

  const fadeOutProgress = activeSection <= 1 ? 1 : 0;

  // Cycle telemetry data jitters periodically
  useEffect(() => {
    if (!startEntry) return;

    const interval = setInterval(() => {
      setTelemetry({
        sync: Number((98.2 + Math.random() * 0.4).toFixed(2)),
        temp: Number((34.5 + Math.random() * 0.6).toFixed(1)),
        delay: Number((0.07 + Math.random() * 0.03).toFixed(2)),
        reg: `0x7FFF9${Math.floor(1000 + Math.random() * 8999).toString(16).toUpperCase()}`
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [startEntry]);

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

  // Use parent controlled activeSection as source of truth for active index
  const activeIndex = activeSection;

  // Handler to scroll smoothly to the targeted section progress position
  const handleNavClick = (idx: number) => {
    if (typeof window === 'undefined') return;
    let targetScroll = 0;
    if (idx === 0) {
      targetScroll = 0;
    } else {
      // Index 1 (PROTOTYPES) starts at 400vh
      // Index 2 (SERVICES) starts at 500vh
      // Index 3 (CONTACT) starts at 600vh
      targetScroll = (idx + 3) * window.innerHeight;
    }
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Top Right Live Telemetry Module - Distinct Wireframe / Grid Layout */}
      <div 
        className="fixed top-8 right-8 md:top-12 md:right-12 lg:top-16 lg:right-16 z-30 select-none border-l border-white/10 hud-dot-grid overflow-hidden transition-all duration-700 ease-out"
        style={{
          opacity: fadeOutProgress,
          pointerEvents: (fadeOutProgress > 0.1 && topRightStage === 3) ? 'auto' : 'none',
          width: topRightStage === 0 ? '0px' : topRightStage === 1 ? '100px' : '250px',
          height: topRightStage < 2 ? '2px' : '176px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 5,
        }}
      >
        {/* Animated Scanning Pointer Slider at the top edge */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10">
          <div className="absolute top-0 h-[1.5px] w-6 bg-accent hud-scan-horizontal shadow-[0_0_6px_#a3e635]" />
        </div>

        {/* Outer Crosshair Ticks for UI bounds */}
        <div className="absolute top-1 left-1.5 font-mono text-[7px] text-accent/60 select-none">+</div>
        <div className="absolute top-1 right-1.5 font-mono text-[7px] text-accent/60 select-none">+</div>
        <div className="absolute bottom-1 left-1.5 font-mono text-[7px] text-accent/60 select-none">+</div>
        <div className="absolute bottom-1 right-1.5 font-mono text-[7px] text-accent/60 select-none">+</div>

        {/* Content Container (fades in only when Stage 3 is reached) */}
        <div 
          className="w-full h-full p-4 flex flex-col justify-between font-mono transition-opacity duration-500"
          style={{
            opacity: topRightStage === 3 ? 1 : 0,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-1">
            <div className="flex items-center gap-1.5 text-[9px] tracking-wider text-accent font-bold">
              <span className="w-1 h-1 bg-accent rounded-full animate-ping" />
              <span>SYS // COORD_TLM</span>
            </div>
            <span className="text-[7px] text-zinc-500 tracking-wider">
              AUTO_SYNC: ON
            </span>
          </div>

          {/* Real-Time Exoskeleton Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[8px] md:text-[9px] text-zinc-400 py-1.5">
            <div className="flex flex-col gap-0.5 border-l-2 border-accent/20 pl-1.5">
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest">[FRAME_IDX]</span>
              <span className="text-zinc-200 font-bold tracking-wider">
                {String(frameIndex).padStart(3, '0')} <span className="text-zinc-500 font-normal">/ 179</span>
              </span>
            </div>

            <div className="flex flex-col gap-0.5 border-l-2 border-accent/20 pl-1.5">
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest">[SYS_DEPTH]</span>
              <span className="text-zinc-200 font-bold tracking-wider">{scrollPixelY} PX</span>
            </div>

            <div className="flex flex-col gap-0.5 border-l-2 border-accent/20 pl-1.5">
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest">[VIEW_RES]</span>
              <span className="text-zinc-200 font-bold tracking-wider">{resolution.w} x {resolution.h}</span>
            </div>

            <div className="flex flex-col gap-0.5 border-l-2 border-accent/20 pl-1.5">
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest">[NEURAL_LNK]</span>
              <span className="text-accent font-bold tracking-wider">{telemetry.sync}%</span>
            </div>
          </div>

          {/* Core Frequency Status & Animated spectrum wave bars */}
          <div className="flex justify-between items-center gap-4 bg-zinc-950/60 border border-white/5 p-2 rounded-none">
            <div className="flex flex-col leading-tight">
              <span className="text-[6px] text-zinc-500 uppercase">[SYS_CLK]</span>
              <span className="text-[9px] text-zinc-300 font-bold tracking-wide">120.00 Hz</span>
            </div>
            
            {/* Animated wave spectrum */}
            <div className="flex items-end gap-[3px] h-4.5 w-16 justify-end select-none">
              <span className="w-[2px] bg-accent/30 rounded-none hud-telemetry-bar-1" />
              <span className="w-[2px] bg-accent/80 rounded-none hud-telemetry-bar-2" />
              <span className="w-[2px] bg-accent/50 rounded-none hud-telemetry-bar-3" />
              <span className="w-[2px] bg-accent rounded-none hud-telemetry-bar-4" />
              <span className="w-[2px] bg-accent/40 rounded-none hud-telemetry-bar-5" />
              <span className="w-[2px] bg-accent/95 rounded-none hud-telemetry-bar-6" />
            </div>
          </div>

          {/* Lower console logs line */}
          <div className="text-[7px] text-zinc-500 uppercase tracking-wide leading-none select-none flex justify-between">
            <span>&gt; RECV_FREQ: 2.45GHZ</span>
            <span className="text-zinc-600 font-bold">STATE: SECURE</span>
          </div>
        </div>
      </div>

      {/* The Vertical Title "SYNEX" with premium stagger fade-in entry animation */}
      <div 
        className="fixed top-1/2 -translate-y-1/2 left-16 md:left-28 lg:left-40 transition-opacity duration-700 ease-out"
        style={{
          opacity: fadeOutProgress,
          pointerEvents: fadeOutProgress > 0.1 ? 'auto' : 'none',
          zIndex: 5,
        }}
      >
        <div className="relative flex flex-col gap-0.5 md:gap-1 font-oxanium font-black text-[12vh] md:text-[15vh] lg:text-[19vh] leading-[0.82] tracking-tighter uppercase text-zinc-200 select-none">
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
      <div className="fixed right-8 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 flex flex-col items-end py-4 z-30 pointer-events-auto">
        
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

                {/* Vertical connector green overlay to the next dot (scroll-driven green trunk) */}
                {idx < sections.length - 1 && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-[1px] h-[32px] pointer-events-none z-0 bg-transparent"
                    style={{ top: '8px' }}
                  >
                    <div 
                      className="w-full bg-accent origin-top transition-[height] duration-75 ease-out"
                      style={{
                        height: `${
                          activeIndex > idx 
                            ? 100 
                            : activeIndex === idx 
                              ? scrollProgress * 100 
                              : 0
                        }%`,
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
        className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 lg:bottom-16 lg:right-16 select-none rounded-none shadow-2xl group flex items-stretch gap-4 ${
          boxStage < 2
            ? 'w-4 h-4'
            : 'w-[320px] md:w-[384px] h-[148px] md:h-[168px]'
        }`}
        style={{
          opacity: boxStage === 0 ? 0 : fadeOutProgress,
          pointerEvents: (boxStage === 3 && fadeOutProgress > 0.1) ? 'auto' : 'none',
          overflow: boxStage < 3 ? 'hidden' : 'visible',
          backgroundColor: boxStage < 2 ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0.1)',
          border: boxStage < 2 ? '1px solid rgba(255, 255, 255, 0)' : '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: boxStage < 2 ? 'blur(0px)' : 'blur(12px)',
          clipPath: boxStage < 2
            ? 'polygon(0px 0, 100% 0, 100% 100%, 100% 100%, 0 100%, 0 0)'
            : 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)',
          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.8s ease, border-color 0.8s ease',
          zIndex: 5,
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
            <span>
              <ScrambledText text="SYS // SYNEX_OVERVIEW" active={boxStage === 3} delay={0} />
            </span>
          </div>
          <div className="space-y-0.5 text-zinc-100">
            <div>
              <span className="text-zinc-400 font-bold">
                <ScrambledText text="[MODEL]" active={boxStage === 3} delay={150} />
              </span>
              &nbsp;&nbsp;
              <span className="text-white">
                <ScrambledText text="SYNEX_V1.00" active={boxStage === 3} delay={250} />
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-bold">
                <ScrambledText text="[TYPE]" active={boxStage === 3} delay={200} />
              </span>
              &nbsp;&nbsp;
              <span className="text-white">
                <ScrambledText text="ORNAMENTAL_EXO" active={boxStage === 3} delay={300} />
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-bold">
                <ScrambledText text="[PURPOSE]" active={boxStage === 3} delay={250} />
              </span>
              &nbsp;
              <span className="text-white">
                <ScrambledText text="SHOWCASING_UI_UX" active={boxStage === 3} delay={350} />
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-bold">
                <ScrambledText text="[CREATOR]" active={boxStage === 3} delay={300} />
              </span>
              &nbsp;
              <span className="text-white">
                <ScrambledText text="RIJURAJ [DEV]" active={boxStage === 3} delay={400} />
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-bold">
                <ScrambledText text="[CLASS]" active={boxStage === 3} delay={350} />
              </span>
              &nbsp;&nbsp;
              <span className="text-white">
                <ScrambledText text="HOBBY_BUILD" active={boxStage === 3} delay={450} />
              </span>
            </div>
          </div>
          <div className="mt-2.5 text-[8px] text-zinc-600 border-t border-white/5 pt-1.5 flex justify-between gap-4">
            <span className="text-accent/60">
              <ScrambledText text="STATUS: NOMINAL" active={boxStage === 3} delay={500} />
            </span>
            <span className="text-zinc-500">
              <ScrambledText text="© 2026" active={boxStage === 3} delay={550} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default HUDOverlay;
