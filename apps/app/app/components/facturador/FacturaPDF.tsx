import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer'
import { fmtNumeroComprobante, DOC_TIPO_LABELS, type Factura, type FacturadorConfig } from '@/types/facturador'

const money = (v: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v || 0)

const styles = StyleSheet.create({
  page:       { padding: 40, fontSize: 9, color: '#111827', backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: '#5448EE' },
  empresaNombre: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#5448EE', marginBottom: 2 },
  empresaMuted:  { color: '#6B7280', fontSize: 8.5 },
  tituloBox:  { alignItems: 'flex-end' },
  tipoBadge:  { width: 28, height: 28, borderWidth: 1.5, borderColor: '#111827', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  tipoLetra:  { fontSize: 15, fontFamily: 'Helvetica-Bold' },
  tituloLabel:{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#5448EE', textTransform: 'uppercase', letterSpacing: 0.5 },
  tituloNum:  { fontSize: 9, color: '#6B7280', marginTop: 2 },
  datosGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  datoBox:    { width: '31%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8 },
  datoFull:   { width: '100%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8, marginBottom: 4 },
  datoLabel:  { fontSize: 7, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  datoVal:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' },
  table:      { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, marginBottom: 14, overflow: 'hidden' },
  tRow:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tHead:      { backgroundColor: '#F9FAFB' },
  tCell:      { padding: 6, fontSize: 8.5 },
  cConcepto:  { flex: 3 },
  cCant:      { flex: 1, textAlign: 'right' },
  cPrecio:    { flex: 1.2, textAlign: 'right' },
  cTotal:     { flex: 1.2, textAlign: 'right' },
  totalBox:   { alignSelf: 'flex-end', width: 200, borderTopWidth: 2, borderTopColor: '#5448EE', paddingTop: 8, marginBottom: 20 },
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  totalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  totalVal:   { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#5448EE' },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  qr:         { width: 70, height: 70 },
  caeBox:     { alignItems: 'flex-end' },
  caeLabel:   { fontSize: 7, color: '#9CA3AF', textTransform: 'uppercase' },
  caeVal:     { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' },
})

function fmtFecha(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function FacturaPDF({ factura, config, qrDataUrl }: { factura: Factura; config: FacturadorConfig; qrDataUrl: string }) {
  const esNC = factura.tipo === 'nc_c'
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.empresaNombre}>{config.razonSocial}</Text>
            <Text style={styles.empresaMuted}>CUIT: {config.cuit}</Text>
          </View>
          <View style={styles.tituloBox}>
            <View style={styles.tipoBadge}><Text style={styles.tipoLetra}>C</Text></View>
            <Text style={styles.tituloLabel}>{esNC ? 'Nota de Crédito' : 'Factura'}</Text>
            <Text style={styles.tituloNum}>{fmtNumeroComprobante(factura.puntoVenta, factura.numero)}</Text>
            <Text style={styles.tituloNum}>{fmtFecha(factura.fecha)}</Text>
          </View>
        </View>

        <View style={styles.datosGrid}>
          <View style={styles.datoFull}>
            <Text style={styles.datoLabel}>Cliente</Text>
            <Text style={styles.datoVal}>
              {factura.clienteNombre}
              {factura.clienteDocNro ? `  ·  ${DOC_TIPO_LABELS[factura.clienteDocTipo]}: ${factura.clienteDocNro}` : '  ·  Consumidor final'}
            </Text>
          </View>
          <View style={styles.datoBox}>
            <Text style={styles.datoLabel}>Condición de venta</Text>
            <Text style={styles.datoVal}>{factura.condicionVenta}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tRow, styles.tHead]}>
            <Text style={[styles.tCell, styles.cConcepto]}>Concepto</Text>
            <Text style={[styles.tCell, styles.cCant]}>Cant.</Text>
            <Text style={[styles.tCell, styles.cPrecio]}>Precio</Text>
            <Text style={[styles.tCell, styles.cTotal]}>Total</Text>
          </View>
          {factura.items.map((item, i) => (
            <View key={i} style={styles.tRow}>
              <Text style={[styles.tCell, styles.cConcepto]}>{item.concepto}</Text>
              <Text style={[styles.tCell, styles.cCant]}>{item.cantidad}</Text>
              <Text style={[styles.tCell, styles.cPrecio]}>{money(item.precio)}</Text>
              <Text style={[styles.tCell, styles.cTotal]}>{money(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{money(factura.total)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Image src={qrDataUrl} style={styles.qr} />
          <View style={styles.caeBox}>
            <Text style={styles.caeLabel}>CAE</Text>
            <Text style={styles.caeVal}>{factura.cae}</Text>
            <Text style={styles.caeLabel}>Vencimiento CAE</Text>
            <Text style={styles.caeVal}>{factura.caeVencimiento ? fmtFecha(factura.caeVencimiento) : '-'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
