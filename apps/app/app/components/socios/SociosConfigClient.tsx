'use client'

import { useState } from 'react'
import { guardarSociosConfig } from '@/lib/actions/socios'
import type { CampoPersonalizado, SociosConfig } from '@/types/socios'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function SociosConfigClient({ configInicial }: { configInicial: SociosConfig }) {
  const [template, setTemplate] = useState(configInicial.mensajeTemplateDefault)
  const [campos, setCampos] = useState<CampoPersonalizado[]>(configInicial.camposPersonalizados)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [tipoNuevo, setTipoNuevo] = useState<'text' | 'number' | 'date'>('text')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setGuardado(false)
    try {
      await guardarSociosConfig({ mensajeTemplateDefault: template.trim(), camposPersonalizados: campos })
      setGuardado(true)
    } finally {
      setGuardando(false)
    }
  }

  function agregarCampo() {
    const name = nombreNuevo.trim()
    if (!name) return
    setCampos((prev) => [...prev, { id: uid(), name, type: tipoNuevo, visible: true }])
    setNombreNuevo('')
    setTipoNuevo('text')
  }

  function quitarCampo(id: string) {
    setCampos((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <form onSubmit={handleGuardar}>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
          <h3 className="text-[14px] font-semibold text-white mb-1">Mensaje de WhatsApp por defecto</h3>
          <p className="text-[11px] text-white/40 mb-3">Se usa como plantilla inicial al crear un cliente nuevo.</p>
          <textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 resize-none" />
          <p className="text-[10px] text-white/25 mt-1.5">
            Variables:{' '}
            {['{nombre}', '{monto}', '{fecha}', '{concepto}'].map((v) => (
              <code key={v} className="bg-white/[0.06] px-1 rounded mx-0.5">{v}</code>
            ))}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
          <h3 className="text-[14px] font-semibold text-white mb-1">Campos personalizados</h3>
          <p className="text-[11px] text-white/40 mb-3">Ej: Rubro, CUIT, Referido por. Aparecen en el formulario de cliente y en su ficha.</p>

          <div className="grid gap-2 sm:grid-cols-12 items-end mb-3">
            <div className="sm:col-span-6">
              <input value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCampo() } }}
                placeholder="Nombre del campo"
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="sm:col-span-3">
              <select value={tipoNuevo} onChange={(e) => setTipoNuevo(e.target.value as any)}
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="date">Fecha</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <button type="button" onClick={agregarCampo} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-[12px] font-medium text-white hover:bg-white/[0.09]">
                Agregar campo
              </button>
            </div>
          </div>

          {campos.length === 0 ? (
            <p className="text-[12px] text-white/30 py-3 text-center">Sin campos personalizados</p>
          ) : (
            <div className="rounded-xl border border-white/[0.09] overflow-x-auto">
              <table className="w-full min-w-[420px] text-[12px]">
                <thead>
                  <tr className="text-white/35 text-[11px] uppercase">
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Ver</th>
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Campo</th>
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Tipo</th>
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {campos.map((c, i) => (
                    <tr key={c.id} className="text-white/80">
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <input type="checkbox" checked={c.visible}
                          onChange={(e) => setCampos((prev) => prev.map((x, idx) => idx === i ? { ...x, visible: e.target.checked } : x))}
                          className="w-[18px] h-[18px] accent-[#5448EE]" />
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <input value={c.name}
                          onChange={(e) => setCampos((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                          className="w-full rounded-lg border border-white/[0.09] bg-white/[0.05] px-2 py-1.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <select value={c.type}
                          onChange={(e) => setCampos((prev) => prev.map((x, idx) => idx === i ? { ...x, type: e.target.value as any } : x))}
                          className="rounded-lg border border-white/[0.09] bg-white/[0.05] px-2 py-1.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                        </select>
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <button type="button" onClick={() => quitarCampo(c.id)} className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10">
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={guardando} className="rounded-xl bg-[#5448EE] px-4 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
            {guardando ? 'Guardando…' : 'Guardar configuración'}
          </button>
          {guardado && <span className="text-[12px] text-emerald-400">Guardado ✓</span>}
        </div>
      </form>
    </div>
  )
}
