import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatCurrency, formatFecha, formatPeriodo, type Recibo, type ReciboConfig } from '@/types/recibo'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#111827', backgroundColor: '#ffffff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#5448EE' },
  muted: { color: '#6B7280', fontSize: 10 },
  section: { marginTop: 16 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12 },
  table: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
  head: { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', paddingVertical: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 8 },
  colConcepto: { width: '72%', paddingHorizontal: 10 },
  colMonto: { width: '28%', paddingHorizontal: 10, textAlign: 'right' },
  totalGreen: { color: '#059669', fontWeight: 700 },
  totalRed: { color: '#DC2626', fontWeight: 700 },
  netoBox: { marginTop: 16, borderWidth: 1.5, borderColor: '#5448EE', borderRadius: 10, padding: 14, alignItems: 'center' },
  netoLabel: { color: '#6B7280', fontSize: 10 },
  netoValue: { color: '#5448EE', fontSize: 18, fontWeight: 700, marginTop: 4 },
  signatures: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  sign: { flex: 1, alignItems: 'center' },
  signLine: { width: '100%', borderTopWidth: 1, borderTopColor: '#9CA3AF', borderStyle: 'dashed', marginBottom: 8 },
  footer: { marginTop: 20, textAlign: 'center', color: '#6B7280', fontSize: 9 },
})

export function ReciboPDF({
  recibo,
  config,
}: {
  recibo: Recibo
  config: ReciboConfig | null
}) {
  const haberes = recibo.conceptos.filter((concepto) => concepto.tipo === 'haber')
  const deducciones = recibo.conceptos.filter((concepto) => concepto.tipo === 'deduccion')
  const isMono = recibo.empModalidad === 'monotributista'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            <Text style={styles.title}>{isMono ? 'RESUMEN DE PAGO' : 'RECIBO DE SUELDO'}</Text>
            <Text style={styles.muted}>Período: {formatPeriodo(recibo.periodo)}</Text>
            <Text style={styles.muted}>Estado: {recibo.estado === 'emitido' ? 'ORIGINAL' : 'BORRADOR'}</Text>
            {isMono ? <Text style={styles.muted}>Documento interno. La factura es el comprobante fiscal válido.</Text> : null}
          </View>
          <View>
            <Text>{config?.razonSocial ?? 'Sin configurar'}</Text>
            <Text style={styles.muted}>CUIT: {config?.cuit ?? '—'}</Text>
            {config?.domicilio ? <Text style={styles.muted}>{config.domicilio}</Text> : null}
            {config?.localidad ? <Text style={styles.muted}>{config.localidad}</Text> : null}
            {config?.actividad ? <Text style={styles.muted}>{config.actividad}</Text> : null}
          </View>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.muted}>EMPLEADO</Text>
            <Text>Nombre: {recibo.empNombre}</Text>
            <Text>CUIL: {recibo.empCuil ?? '—'}</Text>
            <Text>Cargo: {recibo.empCargo ?? '—'}</Text>
            <Text>Fecha ingreso: {recibo.empFechaIngreso ? formatFecha(recibo.empFechaIngreso) : '—'}</Text>
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.muted}>PAGO</Text>
            <Text>Fecha de pago: {formatFecha(recibo.fechaPago)}</Text>
            <Text>Modalidad: {recibo.empModalidad === 'dependencia' ? 'Rel. de dependencia' : 'Monotributista'}</Text>
            {recibo.empModalidad === 'monotributista' ? <Text>N° Factura: {recibo.nroFactura ?? '—'}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.head}>
              <Text style={styles.colConcepto}>HABERES</Text>
              <Text style={styles.colMonto}>IMPORTE</Text>
            </View>
            {haberes.map((concepto) => (
              <View key={concepto.id} style={styles.tableRow}>
                <Text style={styles.colConcepto}>{concepto.descripcion}</Text>
                <Text style={styles.colMonto}>{formatCurrency(concepto.monto)}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={[styles.colConcepto, styles.totalGreen]}>TOTAL HABERES</Text>
              <Text style={[styles.colMonto, styles.totalGreen]}>{formatCurrency(recibo.totalHaberes)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.head}>
              <Text style={styles.colConcepto}>DEDUCCIONES</Text>
              <Text style={styles.colMonto}>IMPORTE</Text>
            </View>
            {deducciones.map((concepto) => (
              <View key={concepto.id} style={styles.tableRow}>
                <Text style={styles.colConcepto}>{concepto.descripcion}</Text>
                <Text style={styles.colMonto}>{formatCurrency(concepto.monto)}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={[styles.colConcepto, styles.totalRed]}>TOTAL DEDUCCIONES</Text>
              <Text style={[styles.colMonto, styles.totalRed]}>{formatCurrency(recibo.totalDeducciones)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.netoBox}>
          <Text style={styles.netoLabel}>NETO A COBRAR</Text>
          <Text style={styles.netoValue}>{formatCurrency(recibo.netoAPagar)}</Text>
        </View>

        <View style={styles.signatures}>
          <View style={styles.sign}>
            <View style={styles.signLine} />
            <Text>Firma del empleador</Text>
          </View>
          <View style={styles.sign}>
            <View style={styles.signLine} />
            <Text>Firma y aclaración del empleado</Text>
          </View>
        </View>

        <Text style={styles.footer}>Generado con Zimple Tools · {new Date().toLocaleDateString('es-AR')}</Text>
      </Page>
    </Document>
  )
}
