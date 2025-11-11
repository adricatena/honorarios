'use client'
import { useFeeData } from '@/hooks/use-fee-data'
import { PDFViewer } from '@react-pdf/renderer'
import { ComprobantePDF } from './comprobante-pdf'

export function ViewerPdfComprobante() {
  const { fee, globals, previousFees } = useFeeData()

  if (!fee || !globals) {
    return <>Cargando...</>
  }

  return (
    <PDFViewer style={{ width: '100%', aspectRatio: 1.29 }}>
      <ComprobantePDF fee={fee} globals={globals} previousFees={previousFees} />
    </PDFViewer>
  )
}
