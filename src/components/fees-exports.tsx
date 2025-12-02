'use client'
import type { Client, Concept, Fee } from '@/payload-types'
import { Button, toast } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'
import type { PaginatedDocs } from 'payload'
import { useState } from 'react'

// Función para convertir datos a CSV
function convertToCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Escapar comillas dobles y envolver en comillas si contiene punto y coma, saltos de línea o comillas
          const cellStr = String(cell ?? '')
          if (cellStr.includes(';') || cellStr.includes('\n') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(';'),
    )
    .join('\n')
}

// Función para descargar el CSV
function downloadCSV(csvContent: string, filename: string): void {
  const BOM = '\uFEFF' // BOM para que Excel reconozca UTF-8
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función para mapear los honorarios a formato CSV
function mapFeesToCSV(fees: Fee[]): string[][] {
  const headers = [
    'Cliente',
    'CUIT Cliente',
    'Periodo',
    'Estado',
    'Fecha de Pago',
    'Método de Pago',
    'Nro. Comprobante',
    'Conceptos',
    'Total',
    'Fecha Creación',
    'Observaciones',
  ]

  const rows = fees.map((fee) => {
    const client = typeof fee.client === 'string' ? null : (fee.client as Client)

    // Calcular total
    const total =
      fee.concepts?.reduce((sum, item) => {
        return sum + (item.price || 0)
      }, 0) || 0

    // Formatear conceptos
    const conceptsStr =
      fee.concepts
        ?.map((item) => {
          const concept = typeof item.concept === 'string' ? null : (item.concept as Concept)
          return `${concept?.name || 'N/A'}: $${item.price.toFixed(2)}`
        })
        .join('; ') || 'Sin conceptos'

    // Formatear fecha de periodo
    const period = new Date(fee.period).toLocaleDateString('es-AR', {
      month: '2-digit',
      year: 'numeric',
    })

    // Formatear fecha de pago
    const paymentDate = fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString('es-AR') : ''

    // Formatear método de pago
    const paymentMethod =
      fee.paymentMethod === 'cash'
        ? 'Efectivo'
        : fee.paymentMethod === 'bank_transfer'
          ? 'Transferencia'
          : ''

    // Formatear estado
    const state = fee.state === 'paid' ? 'Pagado' : 'Adeudado'

    // Formatear fecha de creación
    const createdAt = new Date(fee.createdAt).toLocaleDateString('es-AR')

    // Formatear total como número con coma decimal
    const totalStr = total.toFixed(2).replace('.', ',')

    return [
      client?.business_name || '',
      client?.cuit || '',
      period,
      state,
      paymentDate,
      paymentMethod,
      fee.invoiceNumber?.toString() || '',
      conceptsStr,
      totalStr,
      createdAt,
      fee.observations || '',
    ]
  })

  return [headers, ...rows]
}

export function FeesExports() {
  const rawSearchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  async function handleClickExportCSV() {
    setIsLoading(true)
    try {
      const searchParams = new URLSearchParams(rawSearchParams.toString())
      searchParams.delete('limit')
      searchParams.set('pagination', 'false')

      const url = `/api/fees?${searchParams.toString()}`
      const r = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data: PaginatedDocs<Fee> = await r.json()

      if (!data.docs || data.docs.length === 0) {
        toast.info('No hay datos para exportar')
        return
      }

      const mappedData = mapFeesToCSV(data.docs)
      const csvContent = convertToCSV(mappedData)
      const filename = `honorarios_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csvContent, filename)

      toast.success('¡Tabla exportada correctamente!')
    } catch (error) {
      console.error('Error al descargar el CSV:', error)
      toast.error('Error al descargar el CSV')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Button onClick={handleClickExportCSV} disabled={isLoading}>
        Exportar CSV
      </Button>
      {/* <Button>Exportar PDF</Button> */}
    </div>
  )
}
