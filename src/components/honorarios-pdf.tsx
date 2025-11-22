import type { Client, Concept, Fee, Variable } from '@/payload-types'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 9,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
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
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    fontSize: 7,
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
  paymentInfo: {
    marginTop: 'auto',
    padding: 6,
    backgroundColor: '#f0f0f0',
    borderTop: '1pt solid #ccc',
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  paymentText: {
    fontSize: 7,
    marginBottom: 1,
  },
})

interface Props {
  previousFees: Fee[]
  fee: Fee
  globals: Variable
}

export function HonorariosPDF({ fee, globals, previousFees }: Props) {
  // Calcular el total de honorarios previos adeudados
  const previousFeesTotal =
    previousFees?.reduce((sum, prevFee) => {
      const feeTotal =
        prevFee.concepts?.reduce((conceptSum, item) => {
          return conceptSum + (item.price || 0)
        }, 0) || 0
      return sum + feeTotal
    }, 0) || 0

  // Obtener el cliente (puede ser objeto o string ID)
  const client = typeof fee.client === 'string' ? null : (fee.client as Client)

  // Calcular el total sumando todos los conceptos
  const total =
    fee.concepts?.reduce((sum, item) => {
      return sum + (item.price || 0)
    }, 0) || 0

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
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

        {/* Título del documento */}
        <Text style={styles.title}>
          HONORARIOS -{' '}
          {new Date(fee.period).toLocaleDateString('es-AR', { month: '2-digit', year: 'numeric' })}
        </Text>

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

        {/* Tabla de Conceptos */}
        <View style={styles.table}>
          {/* Header de la tabla */}
          <View style={styles.headerRow}>
            <Text style={[styles.tableHeader, { width: '60%' }]}>CONCEPTO</Text>
            <Text style={[styles.tableHeader, { width: '40%' }]}>IMPORTE</Text>
          </View>

          {/* Honorarios previos adeudados - detallados por periodo */}
          {previousFees && previousFees.length > 0 && (
            <>
              {previousFees.map((prevFee, idx) => {
                const prevFeeTotal =
                  prevFee.concepts?.reduce((sum, item) => {
                    return sum + (item.price || 0)
                  }, 0) || 0
                return (
                  <View key={`prev-${idx}`} style={styles.tableRow}>
                    <Text
                      style={[styles.tableCellConcept, { fontWeight: 'bold', fontStyle: 'italic' }]}
                    >
                      SALDO ANTERIOR -{' '}
                      {new Date(prevFee.period).toLocaleDateString('es-AR', {
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={[styles.tableCellAmount, { fontWeight: 'bold' }]}>
                      $ {formatCurrency(prevFeeTotal)}
                    </Text>
                  </View>
                )
              })}
            </>
          )}

          {/* Filas de conceptos */}
          {fee.concepts && fee.concepts.length > 0 ? (
            fee.concepts.map((item, index) => {
              const concept = typeof item.concept === 'string' ? null : (item.concept as Concept)
              return (
                <View key={index}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellConcept}>
                      {concept ? concept.name : 'Concepto desconocido'}
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
              $ {formatCurrency(total + previousFeesTotal)}
            </Text>
          </View>
        </View>

        {/* Información de pago - siempre al pie */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>INFORMACIÓN DE PAGO</Text>
          <Text style={styles.paymentText}>
            <Text style={{ fontWeight: 'bold' }}>Titular:</Text> {globals.account_holder} |{' '}
            <Text style={{ fontWeight: 'bold' }}>CUIT:</Text> {globals.cuit}
          </Text>
          <Text style={styles.paymentText}>
            <Text style={{ fontWeight: 'bold' }}>Banco:</Text> {globals.bank_name} |{' '}
            <Text style={{ fontWeight: 'bold' }}>Alias:</Text> {globals.bank_alias}
          </Text>
          <Text style={styles.paymentText}>
            <Text style={{ fontWeight: 'bold' }}>CBU:</Text> {globals.cbu}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
