'use client';

interface ServiceItem {
  num: string;
  title: string;
  tag: string;
  desc: string;
}

const servicesData: ServiceItem[] = [
  {
    num: '// 01',
    title: 'NEURAL LINK HARNESS SYNC',
    tag: 'CALIBRATION',
    desc: 'Fine-tuning of deep synaptic couplers to match client neural bandwidth, minimizing transmission delays to less than 1.2 milliseconds.',
  },
  {
    num: '// 02',
    title: 'TITANIUM PLATING FITMENT',
    tag: 'METALLURGY',
    desc: 'Bespoke precision molding of carbon-infused titanium plating designed to maximize kinetic displacement and fit client physical profiles.',
  },
  {
    num: '// 03',
    title: 'THERMAL SHIELD REGULATION',
    tag: 'EXHAUST',
    desc: 'Integration of customized graphene exhaust vents and liquid-nitrogen chambers to prevent cooling throttling during intense operations.',
  },
];

export function ServicesSection() {
  return (
    <section 
      id="services-section"
      className="w-full min-h-screen bg-black text-white flex flex-col justify-center px-8 md:px-16 lg:px-28 py-20 relative z-10 select-none border-t border-white/5"
    >
      {/* Background aesthetic SVG details */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/2 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-16 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <div className="text-[10px] tracking-[0.3em] font-mono text-accent font-bold uppercase mb-2">
            INTEGRATION // LAB_OPERATIONS
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-black tracking-tight uppercase text-zinc-100">
            BESPOKE // SERVICES
          </h2>
        </div>
        <span className="font-mono text-[9px] text-zinc-600 tracking-widest hidden md:inline">
          SYS_VER_3.02 // ABYSS_LABS
        </span>
      </div>

      {/* Services Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {servicesData.map((service, idx) => (
          <div 
            key={idx}
            className="p-6 border border-white/5 hover:border-accent/40 bg-zinc-950/40 hover:bg-zinc-950 transition-all duration-500 flex flex-col justify-between h-[280px] group [clip-path:polygon(12px_0,_100%_0,_100%_calc(100%-12px),_calc(100%-12px)_100%,_0_100%,_0_12px)]"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{service.num}</span>
              <span className="font-mono text-[8px] tracking-widest px-2 py-0.5 border border-zinc-800 text-zinc-400 group-hover:text-accent group-hover:border-accent/30 transition-colors duration-300">
                {service.tag}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold tracking-wider text-zinc-200 group-hover:text-white transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                {service.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ServicesSection;
