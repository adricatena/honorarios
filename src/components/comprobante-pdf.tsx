import type { Client, Concept, Fee, Variable } from '@/payload-types'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

// Estilos para el PDF del comprobante
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 9,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1pt solid #333',
  },
  headerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 1,
  },
  headerTitle: {
    fontSize: 9,
    color: '#666',
    marginBottom: 1,
  },
  headerMatricula: {
    fontSize: 7,
    color: '#888',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  comprobanteNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  paymentDate: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientInfo: {
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f9f9f9',
  },
  clientText: {
    fontSize: 8,
    marginBottom: 1,
  },
  receiptText: {
    fontSize: 8,
    lineHeight: 1.6,
    marginBottom: 15,
    textAlign: 'justify',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 15,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableCellConcept: {
    width: '60%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    fontSize: 7,
  },
  tableCellAmount: {
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    fontSize: 7,
    textAlign: 'right',
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
  },
  totalRow: {
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTop: '1pt solid #ccc',
  },
  footerText: {
    fontSize: 7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureBox: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderTop: '1pt solid #000',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 7,
    textAlign: 'center',
  },
})

interface Props {
  fee: Fee
  globals: Variable
  previousFees: Fee[]
}

export function ComprobantePDF({ fee, globals, previousFees }: Props) {
  // Obtener el cliente (puede ser objeto o string ID)
  const client = typeof fee.client === 'string' ? null : (fee.client as Client)

  // Formatear número de comprobante
  const formattedInvoiceNumber = fee.invoiceNumber
    ? fee.invoiceNumber.toString().padStart(4, '0')
    : '0000'

  // Calcular el total de honorarios previos adeudados
  const previousFeesTotal =
    previousFees?.reduce((sum, prevFee) => {
      const feeTotal =
        prevFee.concepts?.reduce((conceptSum, item) => {
          return conceptSum + (item.price || 0)
        }, 0) || 0
      return sum + feeTotal
    }, 0) || 0

  // Calcular el total sumando todos los conceptos
  const total =
    fee.concepts?.reduce((sum, item) => {
      return sum + (item.price || 0)
    }, 0) || 0

  const totalConSaldoAnterior = total + previousFeesTotal

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Formatear fecha de pago o usar fecha actual
  const paymentDate = fee.paymentDate
    ? new Date(fee.paymentDate).toLocaleDateString('es-AR')
    : new Date().toLocaleDateString('es-AR')

  // Traducir método de pago
  const getPaymentMethodText = (method?: ('cash' | 'bank_transfer') | null) => {
    if (!method) return 'no especificado'
    return method === 'cash' ? 'efectivo' : 'transferencia bancaria'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="portrait">
        {/* Header profesional */}
        <View style={styles.header}>
          <Text style={styles.headerName}>LEANDRO LOPEZ</Text>
          <Text style={styles.headerTitle}>CONTADOR PÚBLICO NACIONAL</Text>
          <Text style={styles.headerMatricula}>MAT. {globals.registration_number}</Text>
        </View>

        {/* Fecha de pago y Número de comprobante en la misma fila */}
        <View style={styles.topRow}>
          <Text style={styles.paymentDate}>Fecha: {paymentDate}</Text>
          <Text style={styles.comprobanteNumber}>N° {formattedInvoiceNumber}</Text>
        </View>

        {/* Título del documento */}
        <Text style={styles.title}>RECIBO DE PAGO DE HONORARIOS</Text>

        {/* Información del Cliente */}
        {client && (
          <View style={styles.clientInfo}>
            <Text style={styles.clientText}>
              <Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {client.business_name}
            </Text>
            <Text style={styles.clientText}>
              <Text style={{ fontWeight: 'bold' }}>CUIT:</Text> {client.cuit}
            </Text>
            {client.address && (
              <Text style={styles.clientText}>
                <Text style={{ fontWeight: 'bold' }}>Dirección:</Text> {client.address}
              </Text>
            )}
          </View>
        )}

        {/* Texto del recibo en formato continuo */}
        <Text style={styles.receiptText}>
          Recibí del Señor <Text style={{ fontWeight: 'bold' }}>{client?.business_name}</Text> la
          cantidad de pesos{' '}
          <Text style={{ fontWeight: 'bold' }}>$ {formatCurrency(totalConSaldoAnterior)}</Text> en{' '}
          <Text style={{ fontWeight: 'bold' }}>{getPaymentMethodText(fee.paymentMethod)}</Text>,
          para ser aplicados al pago de los conceptos indicados en el detalle, correspondientes a
          honorarios profesionales del periodo{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {new Date(fee.period).toLocaleDateString('es-AR', {
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
          {previousFees && previousFees.length > 0 && ' y periodos anteriores adeudados'}.
        </Text>

        {/* Tabla de conceptos detallados */}
        <View style={styles.table}>
          {/* Header de la tabla */}
          <View style={styles.headerRow}>
            <Text style={[styles.tableHeader, { width: '60%' }]}>CONCEPTO</Text>
            <Text style={[styles.tableHeader, { width: '40%' }]}>IMPORTE</Text>
          </View>

          {/* Honorarios previos adeudados - detallados */}
          {previousFees &&
            previousFees.length > 0 &&
            previousFees.map((prevFee, idx) => {
              return prevFee.concepts?.map((item, conceptIdx) => {
                const concept = typeof item.concept === 'string' ? null : (item.concept as Concept)
                const period = new Date(prevFee.period).toLocaleDateString('es-AR', {
                  month: '2-digit',
                  year: 'numeric',
                })
                return (
                  <View key={`prev-${idx}-${conceptIdx}`} style={styles.tableRow}>
                    <Text
                      style={[styles.tableCellConcept, { fontWeight: 'bold', fontStyle: 'italic' }]}
                    >
                      {concept?.name || 'Concepto desconocido'} - {period}
                    </Text>
                    <Text style={[styles.tableCellAmount, { fontWeight: 'bold' }]}>
                      $ {formatCurrency(item.price)}
                    </Text>
                  </View>
                )
              })
            })}

          {/* Conceptos del periodo actual */}
          {fee.concepts && fee.concepts.length > 0 ? (
            fee.concepts.map((item, index) => {
              const concept = typeof item.concept === 'string' ? null : (item.concept as Concept)
              const period = new Date(fee.period).toLocaleDateString('es-AR', {
                month: '2-digit',
                year: 'numeric',
              })
              return (
                <View key={index}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellConcept}>
                      {concept ? concept.name : 'Concepto desconocido'} - {period}
                    </Text>
                    <Text style={styles.tableCellAmount}>$ {formatCurrency(item.price)}</Text>
                  </View>
                  {/* Detalles/módulos del concepto */}
                  {concept?.modules && concept.modules.length > 0 && (
                    <>
                      {concept.modules.map((module, idx) => (
                        <View key={`module-${idx}`} style={styles.tableRow}>
                          <Text
                            style={[
                              styles.tableCellConcept,
                              { fontSize: 6, fontStyle: 'italic', paddingLeft: 8 },
                            ]}
                          >
                            {module.name}
                          </Text>
                          <Text style={styles.tableCellAmount}></Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.tableCellConcept}>Sin conceptos</Text>
              <Text style={styles.tableCellAmount}>$ 0.00</Text>
            </View>
          )}

          {/* Fila de total */}
          <View style={styles.totalRow}>
            <Text style={[styles.tableCellConcept, { fontWeight: 'bold' }]}>TOTAL</Text>
            <Text style={[styles.tableCellAmount, { fontWeight: 'bold' }]}>
              $ {formatCurrency(totalConSaldoAnterior)}
            </Text>
          </View>
        </View>

        {/* Sección de firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma del Cliente</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma Leandro López</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {client?.business_name} - CUIT: {client?.cuit}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
