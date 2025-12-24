/**
 * Get flag image URL for a country code
 * Uses flagcdn.com for high-quality flag images
 */
export function getFlagUrl(countryCode: string, size: number = 64): string {
  if (!countryCode || countryCode.length !== 2) {
    return '' // No flag for unknown
  }

  const code = countryCode.toLowerCase()

  // Handle special cases for TBD teams
  if (code === 'xx') {
    return '' // No flag for TBD
  }

  // Special case: GB is used for England/Scotland but flagcdn uses gb-eng/gb-sct
  // For simplicity, we'll use the UK flag for GB
  // flagcdn.com provides flags in various sizes
  return `https://flagcdn.com/w${size}/${code}.png`
}

/**
 * Convert a 2-letter country code to a flag emoji
 * Uses regional indicator symbols (Unicode)
 */
export function getFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🏳️' // White flag for unknown/TBD
  }

  const code = countryCode.toUpperCase()

  // Handle special cases for TBD teams
  if (code === 'XX') {
    return '🏳️'
  }

  // Convert country code to flag emoji
  // Each letter is converted to its regional indicator symbol
  // 'A' = 0x1F1E6, 'B' = 0x1F1E7, etc.
  const codePoints = [...code].map(
    (char) => 0x1f1e6 + char.charCodeAt(0) - 65
  )

  return String.fromCodePoint(...codePoints)
}

/**
 * Get flag with country code as fallback text
 */
export function getFlagWithCode(countryCode: string): string {
  return `${getFlag(countryCode)} ${countryCode}`
}
