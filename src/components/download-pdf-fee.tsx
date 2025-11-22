'use client'
import { useFeeData } from '@/hooks/use-fee-data'
import type { Client } from '@/payload-types'
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

  const client = typeof fee.client === 'string' ? null : (fee.client as Client)
  const period = new Date(fee.period).toLocaleDateString('es-AR', {
    month: '2-digit',
    year: 'numeric',
  })
  const clientName = client?.business_name || 'cliente'
  const sanitizedClientName = clientName.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <PDFDownloadLink
        document={<HonorariosPDF fee={fee} globals={globals} previousFees={previousFees} />}
        fileName={`honorario-${sanitizedClientName}-${period.replace(/\//g, '-')}.pdf`}
      >
        {({ loading }) => <Button disabled={loading}>{BUTTON_FEE_TEXT}</Button>}
      </PDFDownloadLink>
      <PDFDownloadLink
        document={<ComprobantePDF fee={fee} globals={globals} previousFees={previousFees} />}
        fileName={`comprobante-${sanitizedClientName}-${period.replace(/\//g, '-')}.pdf`}
      >
        {({ loading }) => (
          <Button disabled={loading || fee.state !== 'paid'}>{BUTTON_COMPROBANTE_TEXT}</Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}
