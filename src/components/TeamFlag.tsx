import { getFlagUrl, getFlag } from '../lib/flags'

interface TeamFlagProps {
  countryCode: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: { px: 24, class: 'w-6 h-4' },
  md: { px: 40, class: 'w-10 h-7' },
  lg: { px: 64, class: 'w-16 h-11' },
  xl: { px: 80, class: 'w-20 h-14' },
}

export function TeamFlag({ countryCode, size = 'md', className = '' }: TeamFlagProps) {
  const { px, class: sizeClass } = sizeMap[size]
  const flagUrl = getFlagUrl(countryCode, px)

  // For TBD teams or missing flags, show emoji
  if (!flagUrl) {
    const emojiSize = {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
      xl: 'text-5xl',
    }
    return <span className={`${emojiSize[size]} ${className}`}>{getFlag(countryCode)}</span>
  }

  return (
    <img
      src={flagUrl}
      alt={`${countryCode} flag`}
      className={`${sizeClass} object-cover rounded-sm shadow-sm ${className}`}
      loading="lazy"
    />
  )
}
