import { useState } from 'react'
import { getFlagUrl, getFlag } from '../lib/flags'

interface TeamFlagProps {
  countryCode: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// FlagCDN only supports specific widths: 20, 40, 80, 160, 320, 640, 1280, 2560
const sizeMap = {
  sm: { px: 40, class: 'w-6 h-4' },
  md: { px: 40, class: 'w-10 h-7' },
  lg: { px: 80, class: 'w-16 h-11' },
  xl: { px: 80, class: 'w-20 h-14' },
}

const emojiSizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
}

export function TeamFlag({ countryCode, size = 'md', className = '' }: TeamFlagProps) {
  const [imageError, setImageError] = useState(false)
  const { px, class: sizeClass } = sizeMap[size]
  const flagUrl = getFlagUrl(countryCode, px)

  // For TBD teams, missing flags, or failed image loads, show emoji
  if (!flagUrl || imageError) {
    return <span className={`${emojiSizeMap[size]} ${className}`}>{getFlag(countryCode)}</span>
  }

  return (
    <img
      src={flagUrl}
      alt={`${countryCode} flag`}
      className={`${sizeClass} object-cover rounded-sm shadow-sm ${className}`}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  )
}
