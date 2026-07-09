'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import GarantiaEstadoBadge from './GarantiaEstadoBadge'
import {
  calcularEstadoGarantia,
  diasHastaVencimiento,
  formatDiasRestantes,
  formatFecha,
  type GarantiaEstado,
  type GarantiaProducto,
} from '@/types/garantia'

export default function GarantiasList({ garantias }: { garantias: GarantiaProducto[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [estadoFiltro, setEstadoFiltro] = useState<'todas' | GarantiaEstado>('todas')

  const categorias = useMemo(() => {
    return Array.from(new Set(garantias.map((g) => g.categoria).filter(Boolean))) as string[]
  }, [garantias])

  const items = useMemo(() => {
    return garantias
      .map((garantia) => ({ ...garantia, estadoGarantia: calcularEstadoGarantia(garantia.fechaVencimiento) }))
      .filter((garantia) => {
        const query = busqueda.trim().toLowerCase()
        const searchable = [
          garantia.nombre,
          garantia.marca,
          garantia.modelo,
          garantia.nroSerie,
        ].filter(Boolean).join(' ').toLowerCase()

        if (query && !searchable.includes(query)) return false
        if (categoriaFiltro !== 'todas' && garantia.categoria !== categoriaFiltro) return false
        if (estadoFiltro !== 'todas' && garantia.estadoGarantia !== estadoFiltro) return false
        return true
      })
  }, [busqueda, categoriaFiltro, estadoFiltro, garantias])

  const stats = useMemo(() => {
    const estados = garantias.map((g) => calcularEstadoGarantia(g.fechaVencimiento))
    return {
      total: garantias.length,
      vigentes: estados.filter((e) => e === 'vigente').length,
      porVencer: estados.filter((e) => e === 'por_vencer').length,
      vencidas: estados.filter((e) => e === 'vencida').length,
    }
  }, [garantias])

  if (garantias.length === 0) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
        <p className="text-3xl mb-3">🛡️</p>
        <p className="text-white font-medium mb-1">No hay garantías registradas</p>
        <p className="text-white/35 text-sm mb-5">Agregá tu primer producto para empezar a controlar vencimientos.</p>
        <Link href="/dashboard/garantias/nuevo" className="inline-flex bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          + Nueva garantía
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', stats.total, 'text-white'],
          ['Vigentes', stats.vigentes, 'text-emerald-400'],
          ['Por vencer', stats.porVencer, 'text-yellow-400'],
          ['Vencidas', stats.vencidas, 'text-red-400'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[12px] text-white/35">{label}</p>
            <p className={`mt-2 text-[24px] font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, marca, modelo o serie"
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ['todas', 'Todos'],
            ['vigente', 'Vigente'],
            ['por_vencer', 'Por vencer'],
            ['vencida', 'Vencida'],
            ['sin_fecha', 'Sin fecha'],
          ].map(([value, label]) => {
            const active = estadoFiltro === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setEstadoFiltro(value as 'todas' | GarantiaEstado)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  active ? 'bg-[#5448EE] text-white btn-solid-text' : 'bg-white/[0.05] text-white/45 hover:text-white/75'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((garantia) => {
          const dias = diasHastaVencimiento(garantia.fechaVencimiento)
          return (
            <Link
              key={garantia.id}
              href={`/dashboard/garantias/${garantia.id}`}
              className="block bg-white/[0.04] hover:bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 transition-colors"
              style={{ borderLeftWidth: 3 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      garantia.estadoGarantia === 'vigente' ? 'bg-emerald-400' :
                      garantia.estadoGarantia === 'por_vencer' ? 'bg-yellow-400' :
                      garantia.estadoGarantia === 'vencida' ? 'bg-red-400' : 'bg-white/25'
                    }`} />
                    <p className="text-white text-[16px] font-medium">{garantia.nombre}</p>
                  </div>
                  <p className="text-[13px] text-white/35 mt-1">
                    {[garantia.marca, garantia.modelo, garantia.nroSerie ? `Serie: ${garantia.nroSerie}` : null].filter(Boolean).join(' · ') || 'Sin datos adicionales'}
                  </p>
                </div>
                <GarantiaEstadoBadge estado={garantia.estadoGarantia} />
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/55">
                <p>Comprado: {formatFecha(garantia.fechaCompra)}</p>
                <p>Proveedor: {garantia.proveedor ?? '—'}</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className={`text-[13px] font-medium ${
                  garantia.estadoGarantia === 'vigente' ? 'text-emerald-300' :
                  garantia.estadoGarantia === 'por_vencer' ? 'text-yellow-300' :
                  garantia.estadoGarantia === 'vencida' ? 'text-red-300' : 'text-white/40'
                }`}>
                  ⏱ {formatDiasRestantes(dias)}
                </p>
                <p className="text-[12px] text-white/35">Reclamos: {garantia.reclamos.length} <span className="text-white/55">Ver →</span></p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
