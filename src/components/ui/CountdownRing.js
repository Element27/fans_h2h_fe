'use client'

export default function CountdownRing({ value, max = 10, size = 100, stroke = 4, tone = 'primary' }) {
  const radius = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(1, value / max))
  const dashOffset = circumference * (1 - progress)
  const colorClass = tone === 'danger' ? 'var(--danger-ring)' : 'var(--primary-ring)'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorClass}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 180ms linear, stroke 180ms linear',
            filter: `drop-shadow(0 0 6px ${colorClass})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-2xl font-black text-foreground">{Math.ceil(value)}</span>
      </div>
    </div>
  )
}
