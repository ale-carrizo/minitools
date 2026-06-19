import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer'
import { formatCurrency } from '@/types/recibo'
import type { EmpleadoRecibo, ReciboConfig } from '@/types/recibo'

const styles = StyleSheet.create({
  page:       { padding: 36, fontSize: 9, color: '#111827', backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  // Header empresa
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1.5, borderBottomColor: '#5448EE' },
  logo:       { width: 56, height: 56, objectFit: 'contain' },
  empresaInfo:{ flex: 1, paddingLeft: 12 },
  empresaNombre: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#5448EE', marginBottom: 2 },
  empresaMuted:  { color: '#6B7280', fontSize: 8.5 },
  periodoBox: { alignItems: 'flex-end' },
  periodoLabel: { fontSize: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  periodoVal:   { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginTop: 2 },
  fechaPago:    { fontSize: 8, color: '#6B7280', marginTop: 2 },
  // Empleado
  empBox:    { flexDirection: 'row', gap: 12, marginBottom: 14 },
  empCard:   { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10 },
  empLabel:  { fontSize: 7.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  empVal:    { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  // Tabla conceptos
  tableTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  table:      { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  tableHead:  { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableRow:   { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableRowLast: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10 },
  colLabel:   { flex: 1, color: '#6B7280', fontSize: 8 },
  colMonto:   { width: 90, textAlign: 'right', color: '#6B7280', fontSize: 8 },
  rowLabel:   { flex: 1, color: '#111827', fontSize: 9 },
  rowMonto:   { width: 90, textAlign: 'right', color: '#111827', fontSize: 9 },
  // Totales
  totalesRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  totalBox:   { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10, alignItems: 'center' },
  totalLabel: { fontSize: 7.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  totalHaber: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#059669' },
  totalDedu:  { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#DC2626' },
  // Neto
  netoBox:    { borderWidth: 1.5, borderColor: '#5448EE', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 18 },
  netoLabel:  { fontSize: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  netoVal:    { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#5448EE', marginTop: 4 },
  netoLetras: { fontSize: 8, color: '#9CA3AF', marginTop: 3 },
  // Firmas
  signaturas: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  sigBox:     { alignItems: 'center', width: 160 },
  sigLine:    { width: '100%', borderTopWidth: 1, borderTopColor: '#9CA3AF', borderStyle: 'dashed', marginBottom: 6 },
  sigLabel:   { fontSize: 8, color: '#6B7280' },
  sigNombre:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827', marginTop: 2 },
  // Footer
  footer:     { marginTop: 16, textAlign: 'center', color: '#D1D5DB', fontSize: 7.5, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
})

function numeroALetras(n: number): string {
  const entero = Math.floor(n)
  const decimales = Math.round((n - entero) * 100)
  return `Son pesos ${entero.toLocaleString('es-AR')}${decimales > 0 ? ` con ${decimales}/100` : ''}`
}

export function ReciboPDF({ empleado, config }: { empleado: EmpleadoRecibo; config: ReciboConfig | null }) {
  const haberes    = empleado.conceptos.filter(c => c.tipo === 'haber')
  const deducciones = empleado.conceptos.filter(c => c.tipo === 'deduccion')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
            {config?.logoUrl && (
              <Image src={config.logoUrl} style={styles.logo} />
            )}
            <View style={styles.empresaInfo}>
              <Text style={styles.empresaNombre}>{config?.razonSocial ?? 'Empresa'}</Text>
              {config?.cuit && <Text style={styles.empresaMuted}>CUIT: {config.cuit}</Text>}
              {config?.domicilio && <Text style={styles.empresaMuted}>{config.domicilio}</Text>}
            </View>
          </View>
          <View style={styles.periodoBox}>
            <Text style={styles.periodoLabel}>Recibo de Sueldo</Text>
            <Text style={styles.periodoVal}>{empleado.periodo}</Text>
            <Text style={styles.fechaPago}>Fecha de pago: {empleado.fechaPago}</Text>
          </View>
        </View>

        {/* Datos empleado */}
        <View style={styles.empBox}>
          <View style={styles.empCard}>
            <Text style={styles.empLabel}>Empleado</Text>
            <Text style={styles.empVal}>{empleado.nombre}</Text>
          </View>
          <View style={styles.empCard}>
            <Text style={styles.empLabel}>CUIL</Text>
            <Text style={styles.empVal}>{empleado.cuil || '—'}</Text>
          </View>
          <View style={styles.empCard}>
            <Text style={styles.empLabel}>Cargo</Text>
            <Text style={styles.empVal}>{empleado.cargo || '—'}</Text>
          </View>
          {empleado.categoria && (
            <View style={styles.empCard}>
              <Text style={styles.empLabel}>Categoría</Text>
              <Text style={styles.empVal}>{empleado.categoria}</Text>
            </View>
          )}
          <View style={styles.empCard}>
            <Text style={styles.empLabel}>Modalidad</Text>
            <Text style={styles.empVal}>{empleado.modalidad || '—'}</Text>
          </View>
          {empleado.fechaIngreso && (
            <View style={styles.empCard}>
              <Text style={styles.empLabel}>Ingreso</Text>
              <Text style={styles.empVal}>{empleado.fechaIngreso}</Text>
            </View>
          )}
        </View>

        {/* Haberes */}
        {haberes.length > 0 && (
          <>
            <Text style={styles.tableTitle}>Haberes</Text>
            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={styles.colLabel}>Concepto</Text>
                <Text style={styles.colMonto}>Importe</Text>
              </View>
              {haberes.map((c, i) => (
                <View key={i} style={i === haberes.length - 1 ? styles.tableRowLast : styles.tableRow}>
                  <Text style={styles.rowLabel}>{c.nombre}</Text>
                  <Text style={styles.rowMonto}>{formatCurrency(c.monto)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Deducciones */}
        {deducciones.length > 0 && (
          <>
            <Text style={styles.tableTitle}>Deducciones</Text>
            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={styles.colLabel}>Concepto</Text>
                <Text style={styles.colMonto}>Importe</Text>
              </View>
              {deducciones.map((c, i) => (
                <View key={i} style={i === deducciones.length - 1 ? styles.tableRowLast : styles.tableRow}>
                  <Text style={styles.rowLabel}>{c.nombre}</Text>
                  <Text style={styles.rowMonto}>{formatCurrency(c.monto)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Totales */}
        <View style={styles.totalesRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Haberes</Text>
            <Text style={styles.totalHaber}>{formatCurrency(empleado.totalHaberes)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Deducciones</Text>
            <Text style={styles.totalDedu}>{formatCurrency(empleado.totalDeducciones)}</Text>
          </View>
        </View>

        {/* Neto */}
        <View style={styles.netoBox}>
          <Text style={styles.netoLabel}>Neto a Pagar</Text>
          <Text style={styles.netoVal}>{formatCurrency(empleado.netoAPagar)}</Text>
          <Text style={styles.netoLetras}>{numeroALetras(empleado.netoAPagar)}</Text>
        </View>

        {/* Firmas */}
        <View style={styles.signaturas}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Firma Empleador</Text>
            <Text style={styles.sigNombre}>{config?.razonSocial ?? ''}</Text>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Firma y Aclaración del Empleado</Text>
            <Text style={styles.sigNombre}>{empleado.nombre}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Recibo generado por Zimple Tools · {new Date().toLocaleDateString('es-AR')}
        </Text>
      </Page>
    </Document>
  )
}
