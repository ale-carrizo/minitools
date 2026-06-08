import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { calcularResumen, ESTADO_CONFIG, formatCurrency, formatPeriodo, type Liquidacion } from '@/types/liquidacion'

const styles = StyleSheet.create({
  page: { padding: 32, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  title: { fontSize: 20, fontWeight: 700, color: '#111827' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  table: { marginTop: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  head: { backgroundColor: '#F9FAFB' },
  cell: { fontSize: 9, padding: 6, color: '#111827' },
  summaryWrap: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  box: { width: '48%', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', padding: 10 },
  footer: { marginTop: 24, fontSize: 9, color: '#6B7280', textAlign: 'center' },
})

export function LiquidacionPDF({ liquidacion }: { liquidacion: Liquidacion }) {
  const resumen = calcularResumen(liquidacion.items)
  const estado = ESTADO_CONFIG[liquidacion.estado]
  const today = new Date().toLocaleDateString('es-AR')

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, 'LIQUIDACION DE SUELDOS'),
      React.createElement(Text, { style: styles.subtitle }, `Periodo: ${formatPeriodo(liquidacion.periodo)} · Estado: ${estado.label} · Fecha: ${today}`),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: [styles.row, styles.head] },
          React.createElement(Text, { style: [styles.cell, { width: '30%' }] }, 'Apellido y Nombre'),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, 'Bruto'),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, 'Aportes'),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, 'Neto'),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, 'Contrib. Emp'),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, 'Costo Total'),
        ),
        ...liquidacion.items.map((item) => React.createElement(
          View,
          { key: item.id, style: styles.row },
          React.createElement(Text, { style: [styles.cell, { width: '30%' }] }, item.empleadoNombre),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, formatCurrency(item.totalBruto)),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, formatCurrency(item.totalDeduccs)),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, formatCurrency(item.netoAPagar)),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, formatCurrency(item.totalContribEmp)),
          React.createElement(Text, { style: [styles.cell, { width: '14%' }] }, formatCurrency(item.costoTotalEmp)),
        )),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: [styles.cell, { width: '30%', fontWeight: 700 }] }, 'Totales'),
          React.createElement(Text, { style: [styles.cell, { width: '14%', fontWeight: 700 }] }, formatCurrency(resumen.totalBruto)),
          React.createElement(Text, { style: [styles.cell, { width: '14%', fontWeight: 700 }] }, formatCurrency(resumen.totalDeduccs)),
          React.createElement(Text, { style: [styles.cell, { width: '14%', fontWeight: 700 }] }, formatCurrency(resumen.totalNeto)),
          React.createElement(Text, { style: [styles.cell, { width: '14%', fontWeight: 700 }] }, formatCurrency(resumen.totalContribEmp)),
          React.createElement(Text, { style: [styles.cell, { width: '14%', fontWeight: 700 }] }, formatCurrency(resumen.totalCostoEmp)),
        ),
      ),
      React.createElement(
        View,
        { style: styles.summaryWrap },
        React.createElement(View, { style: styles.box }, React.createElement(Text, null, `Total neto a pagar a empleados: ${formatCurrency(resumen.totalNeto)}`)),
        React.createElement(View, { style: styles.box }, React.createElement(Text, null, `Total aportes empleados: ${formatCurrency(resumen.totalDeduccs)}`)),
        React.createElement(View, { style: styles.box }, React.createElement(Text, null, `Total contribuciones patronales: ${formatCurrency(resumen.totalContribEmp)}`)),
        React.createElement(View, { style: styles.box }, React.createElement(Text, null, `Costo total del periodo: ${formatCurrency(resumen.totalCostoEmp)}`)),
      ),
      React.createElement(Text, { style: styles.footer }, 'Generado con Zimple Tools · zimpletools.com'),
      React.createElement(Text, { style: styles.footer }, 'Este documento es un resumen informativo. No reemplaza el formulario F931.'),
    ),
  )
}
