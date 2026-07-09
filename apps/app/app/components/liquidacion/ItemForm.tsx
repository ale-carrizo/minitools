'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { agregarItem, editarItem } from '@/lib/actions/liquidacion'
import { calcularItem, formatCurrency, type EmpleadoMin, type LiquidacionItem } from '@/types/liquidacion'

export default function ItemForm({
  liquidacionId,
  empleados,
  item,
  artPorcentaje,
  onDone,
}: {
  liquidacionId: string
  empleados: EmpleadoMin[]
  item?: LiquidacionItem
  artPorcentaje: number
  onDone?: () => void
}) {
  const [empleadoId, setEmpleadoId] = useState(item?.empleadoId ?? '')
  const [empleadoNombre, setEmpleadoNombre] = useState(item?.empleadoNombre ?? '')
  const [empleadoCuil, setEmpleadoCuil] = useState(item?.empleadoCuil ?? '')
  const [categoria, setCategoria] = useState(item?.categoria ?? '')
  const [salarioBruto, setSalarioBruto] = useState(item?.salarioBruto ?? 0)
  const [diasTrabajados, setDiasTrabajados] = useState(item?.diasTrabajados ?? 30)
  const [diasHabiles, setDiasHabiles] = useState(item?.diasHabiles ?? 30)
  const [horasExtraMonto, setHorasExtraMonto] = useState(item?.horasExtraMonto ?? 0)
  const [adicionalesMonto, setAdicionalesMonto] = useState(item?.adicionalesMonto ?? 0)
  const [otrasDeduccs, setOtrasDeduccs] = useState(item?.otrasDeduccs ?? 0)
  const [artPct, setArtPct] = useState(artPorcentaje)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selected = useMemo(() => empleados.find((empleado) => empleado.id === empleadoId) ?? null, [empleadoId, empleados])

  useEffect(() => {
    if (!selected || item) return
    setEmpleadoNombre(`${selected.apellido} ${selected.nombre}`.trim())
    setEmpleadoCuil(selected.cuil ?? '')
    setCategoria(selected.categoriaLaboral ?? '')
    setSalarioBruto(selected.salarioBasico ?? 0)
  }, [selected, item])

  const calc = useMemo(() => calcularItem({
    salarioBruto,
    diasTrabajados,
    diasHabiles,
    horasExtraMonto,
    adicionalesMonto,
    otrasDeduccs,
    artPorcentaje: artPct,
  }), [salarioBruto, diasTrabajados, diasHabiles, horasExtraMonto, adicionalesMonto, otrasDeduccs, artPct])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!empleadoNombre.trim()) {
      setError('Completá el nombre del empleado')
      return
    }

    const payload = {
      empleadoId,
      empleadoNombre,
      empleadoCuil,
      categoria,
      salarioBruto,
      diasTrabajados,
      diasHabiles,
      horasExtraMonto,
      adicionalesMonto,
      otrasDeduccs,
      artPorcentaje: artPct,
    }

    startTransition(async () => {
      try {
        if (item) {
          await editarItem(item.id, payload)
        } else {
          await agregarItem(liquidacionId, payload)
        }
        onDone?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el item')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Empleado</h3>
          {empleados.length > 0 ? (
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Seleccionar empleado</label>
              <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
                <option value="">Carga manual</option>
                {empleados.map((empleado) => <option key={empleado.id} value={empleado.id}>{`${empleado.apellido} ${empleado.nombre}`.trim()}</option>)}
              </select>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Nombre *</label>
              <input value={empleadoNombre} onChange={(e) => setEmpleadoNombre(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">CUIL</label>
              <input value={empleadoCuil} onChange={(e) => setEmpleadoCuil(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[12px] text-white/50">Categoría</label>
              <input value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Salario bruto</label>
            <input type="number" value={salarioBruto} onChange={(e) => setSalarioBruto(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Días trabajados</label>
            <input type="number" value={diasTrabajados} onChange={(e) => setDiasTrabajados(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Días hábiles</label>
            <input type="number" value={diasHabiles} onChange={(e) => setDiasHabiles(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <p className="text-[12px] text-[#8880F5] md:col-span-3">Salario proporcional: {formatCurrency(calc.salarioCalculado)}</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Horas extra</label>
            <input type="number" value={horasExtraMonto} onChange={(e) => setHorasExtraMonto(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Otros adicionales</label>
            <input type="number" value={adicionalesMonto} onChange={(e) => setAdicionalesMonto(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Otras deducciones</label>
            <input type="number" value={otrasDeduccs} onChange={(e) => setOtrasDeduccs(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">% ART</label>
            <input type="number" step="0.01" value={artPct} onChange={(e) => setArtPct(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
            <p className="text-[11px] text-white/30">ART varía según actividad y aseguradora. Verificá tu póliza.</p>
          </div>
        </div>

        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div> : null}

        <div className="flex justify-end gap-2">
          {onDone ? <button type="button" onClick={onDone} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button> : null}
          <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
            {isPending ? 'Guardando...' : item ? 'Guardar cambios' : 'Agregar empleado'}
          </button>
        </div>
      </div>

      <aside className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 h-fit">
        <h3 className="text-white font-semibold mb-4">Previsualización</h3>
        <div className="space-y-2 text-[13px] text-white/65">
          <div className="flex justify-between"><span>Bruto a deducir</span><span>{formatCurrency(calc.totalBruto)}</span></div>
          <div className="border-t border-white/[0.08] pt-2 mt-2" />
          <div className="flex justify-between"><span>Jubilación (11%)</span><span>-{formatCurrency(calc.jubilacionEmpl)}</span></div>
          <div className="flex justify-between"><span>Obra Social (3%)</span><span>-{formatCurrency(calc.obraSocialEmpl)}</span></div>
          <div className="flex justify-between"><span>PAMI (3%)</span><span>-{formatCurrency(calc.pamiEmpl)}</span></div>
          <div className="flex justify-between"><span>Otras</span><span>-{formatCurrency(otrasDeduccs)}</span></div>
          <div className="border-t border-white/[0.08] pt-2 mt-2" />
          <div className="flex justify-between text-emerald-300 font-semibold"><span>NETO A PAGAR</span><span>{formatCurrency(calc.netoAPagar)}</span></div>
          <div className="border-t border-white/[0.08] pt-2 mt-2" />
          <p className="text-white/35">Contrib. Empleador</p>
          <div className="flex justify-between"><span>Jubilación (16%)</span><span>{formatCurrency(calc.jubilacionEmp)}</span></div>
          <div className="flex justify-between"><span>FNE (1.5%)</span><span>{formatCurrency(calc.fne)}</span></div>
          <div className="flex justify-between"><span>Obra Social (6%)</span><span>{formatCurrency(calc.obraSocialEmp)}</span></div>
          <div className="flex justify-between"><span>ART ({artPct}%)</span><span>{formatCurrency(calc.artMonto)}</span></div>
          <div className="border-t border-white/[0.08] pt-2 mt-2 flex justify-between text-orange-300 font-semibold"><span>Costo total emp.</span><span>{formatCurrency(calc.costoTotalEmp)}</span></div>
        </div>
      </aside>
    </form>
  )
}
