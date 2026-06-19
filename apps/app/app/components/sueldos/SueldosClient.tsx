'use client'

import { useState, useRef, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { saveReciboConfig } from '@/lib/actions/sueldos'
import type { EmpleadoRecibo, ReciboConfig } from '@/types/recibo'

// react-pdf sólo en cliente
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-[11px] text-white/30">Generando…</span> }
)
const ReciboPDFDynamic = dynamic(
  () => import('./ReciboPDF').then(m => m.ReciboPDF),
  { ssr: false }
)

// ── Parser Excel ──────────────────────────────────────────────────────────────
async function parseExcel(file: File): Promise<EmpleadoRecibo[]> {
  const XLSX = await import('xlsx')
  const buf  = await file.arrayBuffer()
  const wb   = XLSX.read(buf, { type: 'array' })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })

  return rows.map(row => {
    const conceptos = Object.entries(row)
      .filter(([k]) => k.startsWith('H_') || k.startsWith('D_'))
      .map(([k, v]) => ({
        nombre: k.slice(2).trim(),
        monto:  parseFloat(String(v).replace(',', '.')) || 0,
        tipo:   k.startsWith('H_') ? 'haber' as const : 'deduccion' as const,
      }))
      .filter(c => c.monto !== 0)

    const totalHaberes    = conceptos.filter(c => c.tipo === 'haber').reduce((a, c) => a + c.monto, 0)
    const totalDeducciones = conceptos.filter(c => c.tipo === 'deduccion').reduce((a, c) => a + c.monto, 0)

    return {
      nombre:           String(row['Nombre'] ?? row['nombre'] ?? ''),
      cuil:             String(row['CUIL'] ?? row['cuil'] ?? ''),
      cargo:            String(row['Cargo'] ?? row['cargo'] ?? ''),
      categoria:        String(row['Categoría'] ?? row['categoria'] ?? row['Categoria'] ?? ''),
      fechaIngreso:     String(row['Fecha Ingreso'] ?? row['fecha_ingreso'] ?? ''),
      modalidad:        String(row['Modalidad'] ?? row['modalidad'] ?? ''),
      periodo:          String(row['Período'] ?? row['periodo'] ?? row['Periodo'] ?? ''),
      fechaPago:        String(row['Fecha Pago'] ?? row['fecha_pago'] ?? ''),
      conceptos,
      totalHaberes,
      totalDeducciones,
      netoAPagar:       totalHaberes - totalDeducciones,
    }
  }).filter(e => e.nombre)
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SueldosClient({ config: initialConfig }: { config: ReciboConfig | null }) {
  const [config, setConfig]       = useState<ReciboConfig | null>(initialConfig)
  const [empleados, setEmpleados] = useState<EmpleadoRecibo[]>([])
  const [fileName, setFileName]   = useState('')
  const [showConfig, setShowConfig] = useState(!initialConfig)
  const [dragging, setDragging]   = useState(false)
  const [parsing, setParsing]     = useState(false)
  const [saveMsg, setSaveMsg]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const [, startTrans]            = useTransition()

  // Config form state
  const [cfgForm, setCfgForm] = useState({
    razonSocial: initialConfig?.razonSocial ?? '',
    cuit:        initialConfig?.cuit ?? '',
    domicilio:   initialConfig?.domicilio ?? '',
    logoUrl:     initialConfig?.logoUrl ?? '',
  })

  async function handleExcel(file: File) {
    setParsing(true)
    try {
      const data = await parseExcel(file)
      setEmpleados(data)
      setFileName(file.name)
    } catch {
      alert('Error al leer el Excel. Verificá que tenga el formato correcto.')
    } finally {
      setParsing(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleExcel(file)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCfgForm(f => ({ ...f, logoUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function handleSaveConfig() {
    startTrans(async () => {
      const saved = await saveReciboConfig({
        razonSocial: cfgForm.razonSocial,
        cuit:        cfgForm.cuit || undefined,
        domicilio:   cfgForm.domicilio || undefined,
        logoUrl:     cfgForm.logoUrl || undefined,
      })
      setConfig(saved)
      setSaveMsg('Guardado')
      setTimeout(() => setSaveMsg(''), 2000)
      if (cfgForm.razonSocial) setShowConfig(false)
    })
  }

  function fmt(n: number) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n)
  }

  const inputCls = 'w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60'

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Config empresa */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
        <button
          onClick={() => setShowConfig(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-7 h-7 rounded object-contain bg-white/10" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#5448EE]/20 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 20 20" fill="#8880F5">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
            <div className="text-left">
              <p className="text-[13px] font-medium text-white">
                {config?.razonSocial ?? 'Configurar empresa'}
              </p>
              {config?.cuit && <p className="text-[11px] text-white/35">CUIT {config.cuit}</p>}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`text-white/30 transition-transform ${showConfig ? 'rotate-180' : ''}`}>
            <path d="m6 9 6 6 6-6" strokeLinecap="round"/>
          </svg>
        </button>

        {showConfig && (
          <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] text-white/40 mb-1.5">Razón social / Nombre empresa <span className="text-red-400">*</span></label>
                <input type="text" value={cfgForm.razonSocial} onChange={e => setCfgForm(f => ({ ...f, razonSocial: e.target.value }))}
                  placeholder="Empresa S.A." className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-1.5">CUIT</label>
                <input type="text" value={cfgForm.cuit} onChange={e => setCfgForm(f => ({ ...f, cuit: e.target.value }))}
                  placeholder="30-00000000-0" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-1.5">Domicilio</label>
                <input type="text" value={cfgForm.domicilio} onChange={e => setCfgForm(f => ({ ...f, domicilio: e.target.value }))}
                  placeholder="Av. Corrientes 1234, CABA" className={inputCls} />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-[11px] text-white/40 mb-1.5">Logo (PNG/JPG)</label>
              <div className="flex items-center gap-3">
                {cfgForm.logoUrl && (
                  <img src={cfgForm.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain bg-white/10 border border-white/10" />
                )}
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[11px] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors">
                  {cfgForm.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {cfgForm.logoUrl && (
                  <button type="button" onClick={() => setCfgForm(f => ({ ...f, logoUrl: '' }))}
                    className="text-[11px] text-red-400/60 hover:text-red-400">
                    Quitar
                  </button>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button onClick={handleSaveConfig}
                className="px-4 py-2.5 bg-[#5448EE] text-white text-[12px] font-medium rounded-xl hover:bg-[#4438DE] transition-colors">
                Guardar configuración
              </button>
              {saveMsg && <span className="text-[11px] text-emerald-400">{saveMsg}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Zona upload Excel */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all p-10 text-center ${
          dragging
            ? 'border-[#5448EE] bg-[#5448EE]/10'
            : 'border-white/[0.10] hover:border-white/[0.20] hover:bg-white/[0.02]'
        }`}
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleExcel(f) }} />
        {parsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-2 border-[#5448EE] border-t-transparent rounded-full animate-spin" />
            <p className="text-[12px] text-white/50">Leyendo Excel…</p>
          </div>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#5448EE]/10 border border-[#5448EE]/20 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8880F5" strokeWidth={1.5} strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium text-white mb-1">
              {fileName ? `📊 ${fileName}` : 'Subir planilla Excel'}
            </p>
            <p className="text-[11px] text-white/30">
              {fileName
                ? 'Hacé clic para cambiar el archivo'
                : 'Arrastrá el archivo o hacé clic · .xlsx / .xls'}
            </p>
          </>
        )}
      </div>

      {/* Instrucciones formato */}
      {empleados.length === 0 && !parsing && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2">Formato de la planilla</p>
          <p className="text-[11px] text-white/40 mb-2">Cada fila = un empleado. Columnas obligatorias:</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['Nombre', 'CUIL', 'Cargo', 'Modalidad', 'Período', 'Fecha Pago'].map(c => (
              <code key={c} className="text-[10px] bg-white/[0.06] text-[#8880F5] px-2 py-0.5 rounded">{c}</code>
            ))}
          </div>
          <p className="text-[11px] text-white/40 mb-1.5">Conceptos (prefijo obligatorio):</p>
          <div className="flex gap-3">
            <div>
              <p className="text-[10px] text-white/30 mb-1">Haberes → <code className="bg-white/[0.06] text-emerald-400 px-1 rounded">H_</code></p>
              <p className="text-[10px] text-white/25">Ej: H_Básico · H_Antigüedad · H_Horas Extra</p>
            </div>
            <div className="border-l border-white/[0.06] pl-3">
              <p className="text-[10px] text-white/30 mb-1">Deducciones → <code className="bg-white/[0.06] text-red-400 px-1 rounded">D_</code></p>
              <p className="text-[10px] text-white/25">Ej: D_Jubilación · D_Obra Social · D_Sindicato</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista empleados */}
      {empleados.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-white">
              {empleados.length} empleado{empleados.length !== 1 ? 's' : ''} · {fileName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30">Período: {empleados[0]?.periodo}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
            {empleados.map((emp, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-3.5 ${idx !== empleados.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{emp.nombre}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {emp.cargo}{emp.cuil ? ` · ${emp.cuil}` : ''}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-right flex-shrink-0">
                  <div>
                    <p className="text-[10px] text-white/25">Haberes</p>
                    <p className="text-[11px] text-emerald-400 font-medium tabular-nums">{fmt(emp.totalHaberes)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/25">Deduc.</p>
                    <p className="text-[11px] text-red-400 font-medium tabular-nums">{fmt(emp.totalDeducciones)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/25">Neto</p>
                    <p className="text-[12px] text-[#8880F5] font-bold tabular-nums">{fmt(emp.netoAPagar)}</p>
                  </div>
                </div>
                <PDFDownloadLink
                  document={<ReciboPDFDynamic empleado={emp} config={config} />}
                  fileName={`recibo-${emp.nombre.replace(/\s+/g, '-').toLowerCase()}-${emp.periodo}.pdf`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5448EE]/10 border border-[#5448EE]/20 text-[#8880F5] text-[11px] font-medium hover:bg-[#5448EE]/20 transition-colors"
                >
                  {({ loading }) => loading ? 'PDF…' : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      PDF
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
