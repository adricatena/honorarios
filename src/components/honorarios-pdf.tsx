import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
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
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    fontSize: 8,
  },
  tableCellConcept: {
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    fontSize: 8,
  },
  tableCellPeriod: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    fontSize: 8,
    textAlign: 'center',
  },
  tableCellValue: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    fontSize: 8,
    textAlign: 'center',
  },
  tableCellAmount: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    fontSize: 8,
    textAlign: 'right',
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
  },
  totalRow: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    fontWeight: 'bold',
  },
  paymentRow: {
    backgroundColor: '#ffffcc',
    flexDirection: 'row',
    fontWeight: 'bold',
  },
  // Header sin logo - alineado a la izquierda
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '1pt solid #333',
  },

  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  headerMatricula: {
    fontSize: 8,
    color: '#888',
  },
})

// Datos de la tabla
const tableData = [
  { concept: 'LIQUIDACION SUELDO', period: 'Jul-25', value: '6', amount: '138000' },
  {
    concept: 'INFORME CONTROLADOR FISCAL (SEMANAL)',
    period: 'Jul-25',
    value: '1.2',
    amount: '27600',
  },
  { concept: 'DDJJ IVA - LIBRO IVA VTA-COMPRA', period: 'Jul-25', value: '4.5', amount: '103500' },
  { concept: 'DDJJ IIBB - MUNICIPALIDAD', period: 'Jul-25', value: '2.3', amount: '52900' },
  {
    concept: 'ANALISIS DE RECATEGORIZACION FRANCISCO VIGNOLA',
    period: '',
    value: '',
    amount: '60000',
  },
]

export function HonorariosPDF() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header profesional */}
        <View style={styles.header}>
          <Text style={styles.headerName}>LEANDRO LOPEZ</Text>
          <Text style={styles.headerTitle}>CONTADOR PÚBLICO NACIONAL</Text>
          <Text style={styles.headerMatricula}>MAT. 5108 CPEER</Text>
        </View>

        {/* Título del documento */}
        <Text style={styles.title}>HONORARIOS - Aug-25</Text>

        {/* Tabla */}
        <View style={styles.table}>
          {/* Header de la tabla */}
          <View style={styles.headerRow}>
            <Text style={[styles.tableHeader, { width: '40%' }]}>PER. FISCAL</Text>
            <Text style={[styles.tableHeader, { width: '20%' }]}>VALOR MOD</Text>
            <Text style={[styles.tableHeader, { width: '40%' }]}>23000</Text>
          </View>

          {/* Fila "SALDO ANTERIOR" */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellConcept}>SALDO ANTERIOR</Text>
            <Text style={styles.tableCellPeriod}></Text>
            <Text style={styles.tableCellValue}></Text>
            <Text style={styles.tableCellAmount}></Text>
          </View>

          {/* Fila vacía */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellConcept}></Text>
            <Text style={styles.tableCellPeriod}></Text>
            <Text style={styles.tableCellValue}></Text>
            <Text style={styles.tableCellAmount}></Text>
          </View>

          {/* Filas de datos */}
          {tableData.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellConcept}>{row.concept}</Text>
              <Text style={styles.tableCellPeriod}>{row.period}</Text>
              <Text style={styles.tableCellValue}>{row.value}</Text>
              <Text style={styles.tableCellAmount}>{row.amount}</Text>
            </View>
          ))}

          {/* Fila de total */}
          <View style={styles.totalRow}>
            <Text style={[styles.tableCellConcept, { width: '60%' }]}></Text>
            <Text style={[styles.tableCellAmount, { width: '40%', fontWeight: 'bold' }]}>
              382,000.00
            </Text>
          </View>

          {/* Fila de pago destacada */}
          <View style={styles.paymentRow}>
            <Text style={[styles.tableCellConcept, { width: '60%' }]}>
              PAGO 28/08/2025 RECIBO N°0020 TALONARIO 01
            </Text>
            <Text style={styles.tableCellPeriod}>-</Text>
            <Text style={[styles.tableCellAmount, { width: '20%' }]}>382,000.00</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
