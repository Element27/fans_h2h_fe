import clsx from 'clsx'

function ActionButton({ className, variant = 'primary', children, ...props }) {
  return (
    <button
      className={clsx(
        'arena-button',
        variant === 'primary' ? 'arena-button-primary' : 'arena-button-secondary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function PrimaryButton(props) {
  return <ActionButton variant="primary" {...props} />
}

export function SecondaryButton(props) {
  return <ActionButton variant="secondary" {...props} />
}
