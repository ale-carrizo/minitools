// Brand: gradiente #642AEB → #326FEE → #00BDE6, tipografía Inter (bold wordmark / regular "TOOLS")

export function ZimpleIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="zimple-icon-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#642AEB" />
          <stop offset="50%"  stopColor="#326FEE" />
          <stop offset="100%" stopColor="#00BDE6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#zimple-icon-grad)" />
      <path
        d="M13 12.5H27L13 27.5H27"
        stroke="white"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

interface LogoProps {
  size?: number
  theme?: 'dark' | 'light'
  showTagline?: boolean
}

export default function ZimpleLogo({ size = 36, theme = 'dark', showTagline = true }: LogoProps) {
  const textColor = theme === 'dark' ? '#ffffff' : '#111111'
  return (
    <div className="flex items-center gap-2.5">
      <ZimpleIcon size={size} />
      <div className="flex flex-col leading-none">
        <span
          className="font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--font-inter)', color: textColor, fontSize: size * 0.52 }}
        >
          Zimple
        </span>
        {showTagline && (
          <span
            className="font-semibold uppercase text-white/40"
            style={{ fontFamily: 'var(--font-inter)', letterSpacing: '0.28em', fontSize: size * 0.19 }}
          >
            Tools
          </span>
        )}
      </div>
    </div>
  )
}
