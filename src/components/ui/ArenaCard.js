import clsx from 'clsx'

export default function ArenaCard({ className, glow = false, children, ...props }) {
  return (
    <div
      className={clsx('arena-card', glow && 'arena-card-glow', className)}
      {...props}
    >
      {children}
    </div>
  )
}
