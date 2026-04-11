import { memo } from 'react'

function Dashboard() {
  return (
    <section className="relative min-h-screen px-6 pt-28 pb-16 lg:px-[48px]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7c3aed]">SYSTEM DASHBOARD</p>
          <h1 className="max-w-2xl text-[clamp(40px,4vw,66px)] font-black leading-[0.95] tracking-[-0.03em] text-white">
            A calmer cockpit for modern product delivery.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-300">
            This page acts like a control center: a persistent universe, a distinct planet, and a transition style that keeps navigation feeling continuous.
          </p>
        </div>

        <div className="grid gap-6">
          {[
            ['Latency', '12ms'],
            ['Motion', 'Smooth'],
            ['Theme', 'Nebula'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
              <div className="mt-3 text-3xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(Dashboard)