'use client'
import { useFeeData } from '@/hooks/use-fee-data'
import { Button } from '@payloadcms/ui'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ComprobantePDF } from './comprobante-pdf'
import { HonorariosPDF } from './honorarios-pdf'

const BUTTON_FEE_TEXT = 'Descargar Honorario'
const BUTTON_COMPROBANTE_TEXT = 'Descargar Comprobante'

export function DownloadPdfFee() {
  const { fee, globals, previousFees } = useFeeData()

  if (!fee || !globals) {
    return (
      <div>
        <Button disabled>{BUTTON_FEE_TEXT}</Button>
        <Button disabled>{BUTTON_COMPROBANTE_TEXT}</Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <PDFDownloadLink
        document={<HonorariosPDF fee={fee} globals={globals} previousFees={previousFees} />}
        fileName="honorarios-detalle.pdf"
      >
        {({ loading }) => <Button disabled={loading}>{BUTTON_FEE_TEXT}</Button>}
      </PDFDownloadLink>
      <PDFDownloadLink
        document={<ComprobantePDF fee={fee} globals={globals} previousFees={previousFees} />}
        fileName="comprobante-detalle.pdf"
      >
        {({ loading }) => (
          <Button disabled={loading || fee.state !== 'paid'}>{BUTTON_COMPROBANTE_TEXT}</Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}
