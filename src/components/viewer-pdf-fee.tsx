'use client'
import { PDFViewer } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { HonorariosPDF } from './honorarios-pdf'

export function ViewerPdfFee() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>Cargando...</>
  }

  return (
    <PDFViewer>
      <HonorariosPDF />
    </PDFViewer>
  )
}
