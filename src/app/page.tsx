import HeroSequence from "@/components/HeroSequence";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black">
      <HeroSequence />
      
      {/* Spacer to allow scrolling beyond the pinned sequence for a natural feel */}
      <div className="w-full h-screen bg-black flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase tracking-[0.25em]">
        End of interactive disassembly. Abyss Labs © 2026.
      </div>
    </main>
  );
}
