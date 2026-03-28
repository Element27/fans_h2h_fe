'use client'

import { Search } from 'lucide-react'
import clsx from 'clsx'

export default function SearchField({ className, ...props }) {
  return (
    <div className={clsx('arena-card flex items-center gap-3 px-4 py-3', className)}>
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </div>
  )
}
