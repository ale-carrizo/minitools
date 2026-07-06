import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatCurrency, numeroALetras, type ReciboCobro } from '@/types/recibos'

const styles = StyleSheet.create({
  page:       { padding: 40, fontSize: 9, color: '#111827', backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: '#5448EE' },
  empresaNombre: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#5448EE', marginBottom: 2 },
  empresaMuted:  { color: '#6B7280', fontSize: 8.5 },
  tituloBox:  { alignItems: 'flex-end' },
  tituloLabel:{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#5448EE', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  tituloNum:  { fontSize: 9, color: '#6B7280' },
  subtitulo:  { fontSize: 8, color: '#9CA3AF', marginBottom: 16, textAlign: 'center' },
  // Datos
  datosGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  datoBox:    { width: '46%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8, marginBottom: 4 },
  datoFull:   { width: '100%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8, marginBottom: 4 },
  datoLabel:  { fontSize: 7, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  datoVal:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' },
  // Monto grande
  montoBox:   { borderWidth: 2, borderColor: '#5448EE', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 14, marginTop: 4 },
  montoLabel: { fontSize: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  montoVal:   { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#5448EE', marginTop: 6 },
  montoLetras:{ fontSize: 8, color: '#9CA3AF', marginTop: 4 },
  // Concepto
  conceptoBox:{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10, marginBottom: 18 },
  conceptoLabel:{ fontSize: 7.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  conceptoVal:{ fontSize: 9.5, color: '#111827', lineHeight: 1.4 },
  // Firmas
  signaturas: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  sigBox:     { alignItems: 'center', width: 160 },
  sigLine:    { width: '100%', borderTopWidth: 1, borderTopColor: '#9CA3AF', borderStyle: 'dashed', marginBottom: 6 },
  sigLabel:   { fontSize: 8, color: '#6B7280' },
  sigNombre:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827', marginTop: 2 },
  // Footer
  footer:     { marginTop: 30, textAlign: 'center', color: '#D1D5DB', fontSize: 7.5, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
})

export function ReciboCobroPDF({ recibo }: { recibo: ReciboCobro }) {
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return ''
    const [y, m, d] = fechaStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.empresaNombre}>{recibo.emisorNombre}</Text>
            {recibo.emisorDoc && <Text style={styles.empresaMuted}>CUIT: {recibo.emisorDoc}</Text>}
            {recibo.emisorDireccion && <Text style={styles.empresaMuted}>{recibo.emisorDireccion}</Text>}
          </View>
          <View style={styles.tituloBox}>
            <Text style={styles.tituloLabel}>Recibo de Cobro</Text>
            <Text style={styles.tituloNum}>N° {String(recibo.numero).padStart(4, '0')}</Text>
          </View>
        </View>

        <Text style={styles.subtitulo}>
          Recibí de {recibo.receptorNombre || '_________________________'}
          {recibo.receptorDoc ? ` — DNI/CUIT: ${recibo.receptorDoc}` : ''}
        </Text>

        {/* Monto */}
        <View style={styles.montoBox}>
          <Text style={styles.montoLabel}>La suma de</Text>
          <Text style={styles.montoVal}>{formatCurrency(recibo.monto)}</Text>
          <Text style={styles.montoLetras}>{numeroALetras(recibo.monto)}</Text>
        </View>

        {/* Datos */}
        <View style={styles.datosGrid}>
          <View style={styles.datoBox}>
            <Text style={styles.datoLabel}>Fecha</Text>
            <Text style={styles.datoVal}>{formatearFecha(recibo.fecha)}</Text>
          </View>
          <View style={styles.datoBox}>
            <Text style={styles.datoLabel}>Medio de pago</Text>
            <Text style={styles.datoVal}>{recibo.medioPago || '—'}</Text>
          </View>
          {recibo.receptorNombre && (
            <View style={styles.datoFull}>
              <Text style={styles.datoLabel}>Recibido de</Text>
              <Text style={styles.datoVal}>{recibo.receptorNombre}{recibo.receptorDoc ? ` · ${recibo.receptorDoc}` : ''}</Text>
            </View>
          )}
        </View>

        {/* Concepto */}
        <View style={styles.conceptoBox}>
          <Text style={styles.conceptoLabel}>En concepto de</Text>
          <Text style={styles.conceptoVal}>{recibo.concepto}</Text>
        </View>

        {/* Notas */}
        {recibo.notas ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 7.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Notas</Text>
            <Text style={{ fontSize: 8.5, color: '#6B7280', lineHeight: 1.4 }}>{recibo.notas}</Text>
          </View>
        ) : null}

        {/* Firmas */}
        <View style={styles.signaturas}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Firma de quien recibe</Text>
            <Text style={styles.sigNombre}>{recibo.emisorNombre}</Text>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Firma de quien entrega</Text>
            <Text style={styles.sigNombre}>{recibo.receptorNombre || ''}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Recibo generado por Zimple Tools · {new Date().toLocaleDateString('es-AR')}
        </Text>
      </Page>
    </Document>
  )
}
