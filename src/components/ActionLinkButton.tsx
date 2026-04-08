import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ActionLinkButtonProps = {
  to: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
}

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-full no-underline transition duration-150 hover:opacity-80'

const VARIANT_CLASS: Record<NonNullable<ActionLinkButtonProps['variant']>, string> = {
  primary: 'bg-zinc-900 text-white',
  ghost: 'border border-zinc-300 bg-transparent text-zinc-900',
}

const SIZE_CLASS: Record<NonNullable<ActionLinkButtonProps['size']>, string> = {
  sm: 'px-4 py-1.5 text-[13px]',
  md: 'px-6 py-2.5 text-sm',
}

function ActionLinkButton({
  to,
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
}: ActionLinkButtonProps) {
  return (
    <Link
      to={to}
      className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()}
    >
      {children}
    </Link>
  )
}

export default ActionLinkButton