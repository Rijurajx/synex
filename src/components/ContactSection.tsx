'use client';

import { useState } from 'react';

export function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <section 
      id="contact-section"
      className="w-full min-h-screen bg-zinc-950 text-white flex flex-col justify-center px-8 md:px-16 lg:px-28 py-20 relative z-10 select-none border-t border-white/5"
    >
      {/* Grid lines background details */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <div className="text-[10px] tracking-[0.3em] font-mono text-accent font-bold uppercase mb-2">
            SECURE_LINK // INCOMING_QUERY
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-black tracking-tight uppercase text-zinc-100">
            CONNECT // TERMINAL
          </h2>
        </div>
        <span className="font-mono text-[9px] text-zinc-500 tracking-widest leading-relaxed text-right uppercase">
          LOG // PORT_8819<br />
          ABYSS // SECURE
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto w-full">
        {/* Left column: Terminal details */}
        <div className="lg:col-span-5 bg-zinc-950 border border-white/5 p-6 flex flex-col justify-between font-mono text-[9px] md:text-[10px] text-zinc-500 tracking-wide [clip-path:polygon(12px_0,_100%_0,_100%_calc(100%-12px),_calc(100%-12px)_100%,_0_100%,_0_12px)]">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 font-bold text-accent">
              <span className="w-1.5 h-1.5 bg-accent animate-ping rounded-full" />
              <span>TERMINAL // METADATA_STATUS</span>
            </div>
            
            <div className="space-y-1 text-zinc-400">
              <div>HOST // ABYSS_MAIN_MAIN FRAME</div>
              <div>PORT // ENCRYPTED_SSL_OVERFLOW</div>
              <div>LOC // DOCKING_BAY_ZULU_9</div>
              <div>GPS // 35.6762° N, 139.6503° E</div>
            </div>
            
            <div className="border-t border-white/5 pt-4 text-zinc-500 leading-normal">
              &gt;_ TRANSMITTING VIA SECURE PROTOCOL 8819.<br />
              &gt;_ VERIFY CLIENT SYNAPTIC SYNC VALUE IN RANGE BEFORE INITIATING COMMAND.
            </div>
          </div>

          <div className="mt-8 text-zinc-600 text-[8px]">
            © 2026 ABYSS LABS. EXOSKELETON DISASSEMBLY SYSTEM // ONLINE
          </div>
        </div>

        {/* Right column: Interactive form */}
        <div className="lg:col-span-7 bg-zinc-900/10 border border-white/5 p-6 md:p-8 relative [clip-path:polygon(16px_0,_100%_0,_100%_calc(100%-16px),_calc(100%-16px)_100%,_0_100%,_0_16px)]">
          {/* Visual corner accents */}
          <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-accent" />
          <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-accent" />

          {submitted ? (
            <div className="h-full flex flex-col justify-center items-center text-center font-mono py-12">
              <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center mb-4 text-accent animate-pulse font-bold">
                ✓
              </div>
              <h3 className="text-sm tracking-widest text-zinc-100 font-bold uppercase mb-2">
                TRANSMISSION // RECEIVED
              </h3>
              <p className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">
                SYNAPTIC LINK ESTABLISHED. ABYSS LABS OPERATORS WILL REPLY ON YOUR REGISTERED FREQUENCY SHORTLY.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-mono text-[10px] md:text-xs">
              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 uppercase font-bold tracking-widest">[CLIENT_NAME]</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ENTER FULL CODENAME"
                  className="w-full bg-zinc-950/80 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none font-mono tracking-widest uppercase transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 uppercase font-bold tracking-widest">[COMMS_FREQUENCY]</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ENTER SECURE EMAIL CHANNEL"
                  className="w-full bg-zinc-950/80 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none font-mono tracking-widest transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 uppercase font-bold tracking-widest">[QUERY_DATA]</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="TRANSMIT SECURE DATA ENVELOPE..."
                  className="w-full bg-zinc-950/80 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none font-mono tracking-wide transition-colors resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-glow text-black font-black uppercase tracking-[0.25em] py-4 text-center cursor-pointer transition-colors duration-300 disabled:opacity-50 [clip-path:polygon(8px_0,_100%_0,_100%_calc(100%-8px),_calc(100%-8px)_100%,_0_100%,_0_8px)]"
              >
                {loading ? 'CALIBRATING SYNAPSE...' : 'INITIATE CONNECTION // TRANSMIT'}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}

export default ContactSection;
