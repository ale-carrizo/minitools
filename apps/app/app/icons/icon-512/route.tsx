import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #642AEB 0%, #326FEE 50%, #00BDE6 100%)',
      }}>
        <svg width="300" height="300" viewBox="0 0 40 40" fill="none">
          <path d="M13 12.5H27L13 27.5H27" stroke="white" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  )
}
