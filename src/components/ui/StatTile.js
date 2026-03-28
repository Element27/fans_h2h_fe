import ArenaCard from '@/components/ui/ArenaCard'

export default function StatTile({ icon: Icon, label, value, tone = 'default' }) {
  const valueClass =
    tone === 'primary'
      ? 'text-primary neon-text'
      : tone === 'accent'
        ? 'text-accent gold-text'
        : tone === 'destructive'
          ? 'text-destructive'
          : 'text-foreground'

  return (
    <ArenaCard className="p-4 text-center">
      {Icon ? <Icon className="mx-auto mb-2 h-4 w-4 text-muted-foreground" /> : null}
      <div className={`font-display text-lg font-black ${valueClass}`}>{value}</div>
      <div className="metadata-label mt-1 text-[10px]">{label}</div>
    </ArenaCard>
  )
}
