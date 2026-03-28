import clsx from 'clsx'

export default function ScreenHeader({ eyebrow, title, subtitle, align = 'left', className }) {
  return (
    <div className={clsx('space-y-3', align === 'center' && 'text-center', className)}>
      {eyebrow ? <p className="metadata-label">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-black uppercase tracking-[-0.08em] text-foreground md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
