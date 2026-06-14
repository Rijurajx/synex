'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroSequence } from '../components/HeroSequence';
import { PrototypesSection } from '../components/PrototypesSection';
import { ServicesSection } from '../components/ServicesSection';
import { ContactSection } from '../components/ContactSection';
import { HUDOverlay } from '../components/HUDOverlay';



export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const prototypesRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [startEntry, setStartEntry] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const val = window.scrollY / window.innerHeight;
      if (val < 4) {
        setActiveSection(0);
        setScrollProgress(val / 4);
      } else if (val < 5) {
        setActiveSection(1);
        setScrollProgress(val - 4);
      } else if (val < 6) {
        setActiveSection(2);
        setScrollProgress(val - 5);
      } else {
        setActiveSection(3);
        setScrollProgress(Math.min(1, val - 6));
      }
    };

    // Run once on load/mount to calibrate positions
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="w-full min-h-screen bg-black">
      {/* Hero Sequence Section (HOME // idx 0) */}
      <div ref={heroRef} className="w-full">
        <HeroSequence 
          onScrollUpdate={() => {}}
          onLoaded={(fadingOut) => setStartEntry(fadingOut)}
          activeSection={activeSection}
          scrollProgress={scrollProgress}
        />
      </div>

      {/* Prototypes Grid Section (PROTOTYPES // idx 1) */}
      <div ref={prototypesRef} className="w-full">
        <PrototypesSection 
          activeSection={activeSection}
          scrollProgress={scrollProgress}
        />
      </div>

      {/* Services Section (SERVICES // idx 2) */}
      <div ref={servicesRef} className="w-full">
        <ServicesSection />
      </div>

      {/* Contact Form Terminal Section (CONTACT // idx 3) */}
      <div ref={contactRef} className="w-full">
        <ContactSection />
      </div>

      {/* Persistent HUD Overlay fixed to the viewport */}
      <HUDOverlay 
        startEntry={startEntry} 
        scrollProgress={scrollProgress} 
        activeSection={activeSection} 
      />
    </main>
  );
}
