export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0C0B1A] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="aurora pointer-events-none" />
      <div
        className="absolute pointer-events-none"
        style={{
          width: '700px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #642AEB 0%, #326FEE 40%, #00BDE6 70%, transparent 85%)',
          filter: 'blur(6px)', opacity: 0.10,
          top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
        }}
      />
      <div className="w-full max-w-lg relative z-10 py-10">
        {children}
      </div>
    </div>
  )
}
