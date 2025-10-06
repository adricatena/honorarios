'use client'
import { Button } from '@payloadcms/ui'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { HonorariosPDF } from './honorarios-pdf'

export function DownloadPdfFee() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <Button disabled>Cargando...</Button>
  }

  return (
    <PDFDownloadLink document={<HonorariosPDF />} fileName="honorarios-detalle.pdf">
      {({ loading }) =>
        loading ? <Button disabled>Generando PDF...</Button> : <Button>Descargar PDF</Button>
      }
    </PDFDownloadLink>
  )
}
