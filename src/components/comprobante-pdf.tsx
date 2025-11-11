import type { Client, Fee, Variable } from '@/payload-types'
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
  clientInfo: {
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f9f9f9',
  },
  clientText: {
    fontSize: 8,
    marginBottom: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    width: '30%',
  },
  infoValue: {
    fontSize: 8,
    width: '70%',
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
  receiptNumber?: string
}

export function ComprobantePDF({ fee, globals, previousFees, receiptNumber = '0001' }: Props) {
  // Obtener el cliente (puede ser objeto o string ID)
  const client = typeof fee.client === 'string' ? null : (fee.client as Client)

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

  // Formatear fecha
  const currentDate = new Date().toLocaleDateString('es-AR')

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="portrait">
        {/* Header profesional */}
        <View style={styles.header}>
          <Text style={styles.headerName}>LEANDRO LOPEZ</Text>
          <Text style={styles.headerTitle}>CONTADOR PÚBLICO NACIONAL</Text>
          <Text style={styles.headerMatricula}>MAT. {globals.registration_number}</Text>
        </View>

        {/* Número de comprobante */}
        <Text style={styles.comprobanteNumber}>N° {receiptNumber}</Text>

        {/* Título del documento */}
        <Text style={styles.title}>RECIBO DE PAGO DE HONORARIOS</Text>

        {/* Información del Cliente */}
        {client && (
          <View style={styles.clientInfo}>
            <Text style={styles.clientText}>
              <Text style={{ fontWeight: 'bold' }}>Recibí de:</Text> {client.business_name}
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

        {/* Información del pago */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vale $:</Text>
          <Text style={styles.infoValue}>{formatCurrency(totalConSaldoAnterior)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>La cantidad de pesos:</Text>
          <Text style={styles.infoValue}>
            {/* Aquí podrías agregar una función para convertir números a palabras */}
            (ver detalle)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Recibí del Señor:</Text>
          <Text style={styles.infoValue}>{client ? client.business_name : ''}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>La cantidad de pesos:</Text>
          <Text style={styles.infoValue}>
            Para ser aplicados al pago de los conceptos indicados en anexo I/II
          </Text>
        </View>

        {/* Tabla de conceptos - Anexo */}
        <View style={styles.table}>
          {/* Header de la tabla */}
          <View style={styles.headerRow}>
            <Text style={[styles.tableHeader, { width: '60%' }]}>PERÍODO</Text>
            <Text style={[styles.tableHeader, { width: '40%' }]}>IMPORTE</Text>
          </View>

          {/* Honorarios previos adeudados */}
          {previousFees && previousFees.length > 0 && (
            <>
              {previousFees.map((prevFee, idx) => {
                const prevFeeTotal =
                  prevFee.concepts?.reduce((sum, item) => {
                    return sum + (item.price || 0)
                  }, 0) || 0
                return (
                  <View key={`prev-${idx}`} style={styles.tableRow}>
                    <Text style={styles.tableCellConcept}>
                      {new Date(prevFee.period).toLocaleDateString('es-AR', {
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.tableCellAmount}>$ {formatCurrency(prevFeeTotal)}</Text>
                  </View>
                )
              })}
            </>
          )}

          {/* Periodo actual */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellConcept}>
              {new Date(fee.period).toLocaleDateString('es-AR', {
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.tableCellAmount}>$ {formatCurrency(total)}</Text>
          </View>

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
          <Text style={styles.footerText}>Fecha de emisión: {currentDate}</Text>
        </View>
      </Page>
    </Document>
  )
}
