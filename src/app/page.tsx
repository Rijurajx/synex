import HeroSequence from "@/components/HeroSequence";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black">
      <HeroSequence />
      
      {/* Spacer to allow scrolling beyond the pinned sequence for a natural feel */}
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-center px-6 text-zinc-600 font-mono text-[10px] uppercase tracking-[0.25em]">
        <span>End of interactive disassembly.</span>
        <span className="mt-1">Abyss Labs © 2026.</span>
      </div>
    </main>
  );
}
