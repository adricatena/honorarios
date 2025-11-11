'use client'
import { useFeeData } from '@/hooks/use-fee-data'
import { PDFViewer } from '@react-pdf/renderer'
import { HonorariosPDF } from './honorarios-pdf'

export function ViewerPdfFee() {
  const { fee, globals, previousFees } = useFeeData()

  if (!fee || !globals) {
    return <>Cargando...</>
  }

  return (
    <PDFViewer style={{ width: '100%', aspectRatio: 1.29 }}>
      <HonorariosPDF fee={fee} globals={globals} previousFees={previousFees} />
    </PDFViewer>
  )
}
