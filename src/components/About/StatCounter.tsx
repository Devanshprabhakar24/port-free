import { memo } from 'react'

type StatCounterProps = {
  value: number
  suffix: string
  label: string
  onHover: () => void
}

function StatCounter({ value, suffix, label, onHover }: StatCounterProps) {
  const coordinate = String(value).padStart(2, '0')

  return (
    <div className="group" onMouseEnter={onHover}>
      <div className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#7c3aed]">
        [{coordinate}]
      </div>
      <div className="mt-1 font-display text-[64px] leading-[0.95] text-white">
        {value}
        {suffix}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</div>
    </div>
  )
}

export default memo(StatCounter)
