'use client'
import { useFeeData } from '@/hooks/use-fee-data'
import { Button } from '@payloadcms/ui'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { HonorariosPDF } from './honorarios-pdf'

const BUTTON_TEXT = 'Descargar PDF'

export function DownloadPdfFee() {
  const { fee, globals, previousFees } = useFeeData()

  if (!fee || !globals) {
    return <Button disabled>{BUTTON_TEXT}</Button>
  }

  return (
    <PDFDownloadLink
      document={<HonorariosPDF fee={fee} globals={globals} previousFees={previousFees} />}
      fileName="honorarios-detalle.pdf"
    >
      {({ loading }) => <Button disabled={loading}>{BUTTON_TEXT}</Button>}
    </PDFDownloadLink>
  )
}
