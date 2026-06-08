import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import {
  calcularTotales,
  formatCurrency,
  formatPresupuestoNumero,
  type Presupuesto,
} from '@/types/presupuesto'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: '#1a1a2e',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    color: '#5448EE',
    fontWeight: 700,
  },
  metaText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
  },
  panel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  panelTitle: {
    marginBottom: 8,
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
  },
  cellIndex: { width: '8%', paddingHorizontal: 8 },
  cellDesc: { width: '42%', paddingHorizontal: 8 },
  cellQty: { width: '12%', paddingHorizontal: 8 },
  cellPrice: { width: '18%', paddingHorizontal: 8 },
  cellSubtotal: { width: '20%', paddingHorizontal: 8 },
  totals: {
    marginTop: 18,
    marginLeft: 'auto',
    width: 220,
    gap: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 700,
    color: '#5448EE',
  },
  notes: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
})

export function PresupuestoPDF({
  presupuesto,
  emisorNombre,
}: {
  presupuesto: Presupuesto
  emisorNombre?: string | null
}) {
  const totals = calcularTotales(presupuesto.items, presupuesto.descuento, presupuesto.iva)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PRESUPUESTO</Text>
            <Text style={styles.metaText}>{formatPresupuestoNumero(presupuesto.numero)}</Text>
          </View>
          <View>
            <Text style={styles.metaText}>Fecha emision: {presupuesto.fechaEmision}</Text>
            <Text style={styles.metaText}>Vence: {presupuesto.fechaVence ?? 'Sin vencimiento'}</Text>
            <Text style={styles.metaText}>Moneda: {presupuesto.moneda}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Para</Text>
            <Text>{presupuesto.cliente?.nombre ?? 'Consumidor final'}</Text>
            {presupuesto.cliente?.empresa ? <Text>{presupuesto.cliente.empresa}</Text> : null}
            {presupuesto.cliente?.email ? <Text>{presupuesto.cliente.email}</Text> : null}
            {presupuesto.cliente?.cuit ? <Text>CUIT: {presupuesto.cliente.cuit}</Text> : null}
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>De</Text>
            <Text>{emisorNombre ?? 'Usuario'}</Text>
            <Text>{presupuesto.titulo}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellIndex}>#</Text>
            <Text style={styles.cellDesc}>Descripcion</Text>
            <Text style={styles.cellQty}>Cant</Text>
            <Text style={styles.cellPrice}>Precio</Text>
            <Text style={styles.cellSubtotal}>Subtotal</Text>
          </View>
          {presupuesto.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.cellIndex}>{index + 1}</Text>
              <Text style={styles.cellDesc}>{item.descripcion}</Text>
              <Text style={styles.cellQty}>{item.cantidad}</Text>
              <Text style={styles.cellPrice}>{formatCurrency(item.precioUnitario, presupuesto.moneda)}</Text>
              <Text style={styles.cellSubtotal}>{formatCurrency(item.subtotal, presupuesto.moneda)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(totals.subtotal, presupuesto.moneda)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Descuento {presupuesto.descuento}%</Text>
            <Text>- {formatCurrency(totals.descuentoMonto, presupuesto.moneda)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Base</Text>
            <Text>{formatCurrency(totals.base, presupuesto.moneda)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>IVA {presupuesto.iva}%</Text>
            <Text>{formatCurrency(totals.ivaMonto, presupuesto.moneda)}</Text>
          </View>
          <View style={styles.finalRow}>
            <Text>TOTAL</Text>
            <Text>{formatCurrency(totals.totalFinal, presupuesto.moneda)}</Text>
          </View>
        </View>

        {presupuesto.notasCliente ? (
          <View style={styles.notes}>
            <Text style={styles.panelTitle}>Notas para el cliente</Text>
            <Text>{presupuesto.notasCliente}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
