'use client';

import { useState } from 'react';

interface PrototypeCard {
  id: string;
  name: string;
  codename: string;
  class: string;
  integration: string;
  plating: string;
  weight: string;
  details: string;
  metrics: { sync: number; thermal: number; defense: number };
}

const prototypesData: PrototypeCard[] = [
  {
    id: 'proto-mark-v',
    name: 'SYNEX MARK V // DISSEMBLER',
    codename: 'GHOST_SPEC_V5',
    class: 'RECON / STEALTH',
    integration: 'DIRECT NEURAL DEEP SYNC',
    plating: 'GRADE-5 TITANIUM MESH / AL-LI',
    weight: '1.42 KG (HELMET)',
    details: 'Equipped with active neural feedback loops, optical camo drivers, and direct interface telemetry for target tracking.',
    metrics: { sync: 98, thermal: 42, defense: 75 },
  },
  {
    id: 'proto-titan-x',
    name: 'TITAN EXO-SKELETON PLATING',
    codename: 'HEAVY_SPEC_X9',
    class: 'COMBAT / REINFORCED',
    integration: 'SPINAL SYNAPTIC HARNESS',
    plating: 'CARBIDE-REINFORCED GRAPHENE GRAPHITE',
    weight: '14.85 KG (FULL CHASSIS)',
    details: 'Heavy-duty exoskeleton plating designed to amplify user output, absorb high kinetic shockwaves, and regulate thermal exhaust.',
    metrics: { sync: 91, thermal: 88, defense: 99 },
  },
  {
    id: 'proto-specter-s',
    name: 'SPECTER TELEMETRY HELMET',
    codename: 'INTEL_SPEC_S1',
    class: 'CYBER / INTELLIGENCE',
    integration: 'WIRELESS NEUROLINK PROTOCOL',
    plating: 'DOPED CARBON NANOTUBE SHELL',
    weight: '1.15 KG (HELMET)',
    details: 'Optimized for drone control and real-time network slicing. Integrates direct HUD telemetry streaming with zero lag latency.',
    metrics: { sync: 99, thermal: 32, defense: 60 },
  },
];

interface PrototypesSectionProps {
  activeSection?: number;
  scrollProgress?: number;
}

export function PrototypesSection({ activeSection = 1, scrollProgress = 1 }: PrototypesSectionProps) {
  const [selectedProto, setSelectedProto] = useState<string>('proto-mark-v');

  const activeProto = prototypesData.find((p) => p.id === selectedProto) || prototypesData[0];

  return (
    <section 
      id="prototypes-section"
      className="w-full min-h-screen bg-zinc-950 text-white flex flex-col justify-center px-8 md:px-16 lg:px-28 py-20 relative z-10 select-none border-t border-white/5"
    >
      {/* Background Matrix Telemetry lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Futuristic Header */}
      <div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="text-[10px] tracking-[0.3em] font-mono text-accent font-bold uppercase mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent animate-ping rounded-full" />
            <span>DATALINK // PROTOTYPE_CATALOG</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-black tracking-tight uppercase text-zinc-100">
            BLUEPRINT // SPECS
          </h2>
        </div>
        <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest text-right leading-relaxed">
          <div>LOC // DEEP_LABS_SECTOR_07</div>
          <div>STATUS // DIAGNOSTICS ACTIVE</div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: List of Prototypes */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {prototypesData.map((proto) => {
            const isSelected = proto.id === selectedProto;
            return (
              <div
                key={proto.id}
                id={`proto-btn-${proto.id}`}
                onClick={() => setSelectedProto(proto.id)}
                className={`p-4 border transition-all duration-500 cursor-pointer flex flex-col justify-between relative [clip-path:polygon(8px_0,_100%_0,_100%_calc(100%-8px),_calc(100%-8px)_100%,_0_100%,_0_8px)] ${
                  isSelected 
                    ? 'bg-accent/5 border-accent shadow-[0_0_15px_rgba(163,230,53,0.15)]' 
                    : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/80'
                }`}
              >
                {/* Visual anchor corners */}
                {isSelected && (
                  <>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent" />
                  </>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-mono text-[8px] tracking-widest px-2 py-0.5 border ${
                    isSelected ? 'border-accent/30 text-accent bg-accent/10' : 'border-zinc-800 text-zinc-500'
                  }`}>
                    {proto.codename}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500">{proto.class}</span>
                </div>
                
                <h3 className={`text-base font-bold tracking-wider transition-colors duration-300 ${
                  isSelected ? 'text-accent' : 'text-zinc-200'
                }`}>
                  {proto.name}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Right column: Interactive Telemetry Details Panel */}
        <div className="lg:col-span-7 bg-zinc-900/20 border border-white/5 p-6 md:p-8 flex flex-col justify-between relative [clip-path:polygon(16px_0,_100%_0,_100%_calc(100%-16px),_calc(100%-16px)_100%,_0_100%,_0_16px)]">
          
          {/* Subtle grid corner tech brackets */}
          <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-accent/40" />
          <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-accent/40" />

          {/* Panel Layout */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="font-mono text-xs text-zinc-400 font-bold uppercase">
                SPECIFICATIONS // TELEMETRY
              </span>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>

            {/* Spec lines */}
            <div className="space-y-3 font-mono text-[10px] md:text-xs text-zinc-300">
              <div className="flex border-b border-white/5 pb-2">
                <span className="w-32 text-zinc-500 font-bold uppercase">[MODEL_CLASS]</span>
                <span className="text-white font-bold">{activeProto.class}</span>
              </div>
              <div className="flex border-b border-white/5 pb-2">
                <span className="w-32 text-zinc-500 font-bold uppercase">[INTEGRATION]</span>
                <span className="text-white font-bold">{activeProto.integration}</span>
              </div>
              <div className="flex border-b border-white/5 pb-2">
                <span className="w-32 text-zinc-500 font-bold uppercase">[COMPOSITE]</span>
                <span className="text-white font-bold">{activeProto.plating}</span>
              </div>
              <div className="flex border-b border-white/5 pb-2">
                <span className="w-32 text-zinc-500 font-bold uppercase">[NET_WEIGHT]</span>
                <span className="text-white font-bold">{activeProto.weight}</span>
              </div>
            </div>

            {/* Summary Details */}
            <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed tracking-wide pt-2">
              {activeProto.details}
            </p>
          </div>

          {/* Graphic System Calibration metrics bar */}
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col md:flex-row gap-6 items-center">
            {Object.entries(activeProto.metrics).map(([key, val]) => (
              <div key={key} className="w-full flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                  <span>{key}_sync</span>
                  <span className="text-accent font-bold">{val}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-none overflow-hidden relative">
                  <div 
                    className="h-full bg-accent transition-all duration-1000 ease-out"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

export default PrototypesSection;
