'use client'
import type { Client, Config, Fee } from '@/payload-types'
import { convertToCSV, downloadCSV } from '@/utils/csv'
import { PayloadSDK } from '@payloadcms/sdk'
import { Button, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

const sdk = new PayloadSDK<Config>({
  baseURL: '/api',
})

function mapResumeToCSV(client: Client, fees: Fee[]): string[][] {
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

  const feesRows = fees.map((fee) => {
    const clientObj = typeof fee.client === 'string' ? client : (fee.client as Client)

    // Calcular total
    const total =
      fee.concepts?.reduce((sum, item) => {
        return sum + (item.price || 0)
      }, 0) || 0

    // Formatear conceptos
    const conceptsStr =
      fee.concepts
        ?.map((item) => {
          const concept = typeof item.concept === 'string' ? null : (item.concept as any)
          return `${concept?.name || 'N/A'}: $${item.price.toFixed(2)}`
        })
        .join('; ') || 'Sin conceptos'

    // Formatear fecha de periodo
    const period = new Date(fee.period).toLocaleDateString('es-AR', {
      month: 'short',
      year: '2-digit',
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
      clientObj?.business_name || '',
      clientObj?.cuit || '',
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

  // Empty rows separator
  const emptyRow = Array(11).fill('')

  // Ledger headers
  const ledgerHeaders = [
    '',
    '',
    '',
    '',
    '',
    '',
    'fecha',
    client.business_name,
    'debe',
    'haber',
    'saldo',
  ]

  // Calcular movimientos reales para la cuenta corriente
  const movements: { date: Date; description: string; debe: number; haber: number }[] = []

  fees.forEach((fee) => {
    const total =
      fee.concepts?.reduce((sum, item) => {
        return sum + (item.price || 0)
      }, 0) || 0

    // Cargo por honorarios (Debe)
    const periodDate = new Date(fee.period)
    const periodStr = periodDate.toLocaleDateString('es-AR', { month: '2-digit', year: 'numeric' })
    movements.push({
      date: new Date(fee.createdAt),
      description: `Honorarios ${periodStr}`,
      debe: total,
      haber: 0,
    })

    // Si está pagado, registrar el pago (Haber)
    if (fee.state === 'paid') {
      movements.push({
        date: fee.paymentDate ? new Date(fee.paymentDate) : new Date(fee.updatedAt),
        description: `Pago${fee.paymentMethod === 'bank_transfer' ? ' (Transferencia)' : fee.paymentMethod === 'cash' ? ' (Efectivo)' : ''}`,
        debe: 0,
        haber: total,
      })
    }
  })

  // Ordenar cronológicamente
  movements.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Calcular saldos y formatear filas
  let saldo = 0
  const formatCurrency = (val: number, showZero = false) => {
    if (val === 0 && !showZero) return ''
    return `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`
  }

  const ledgerRows = movements.map((m) => {
    saldo += m.debe - m.haber
    return [
      '',
      '',
      '',
      '',
      '',
      '',
      m.date.toLocaleDateString('es-AR'),
      m.description,
      formatCurrency(m.debe),
      formatCurrency(m.haber),
      formatCurrency(saldo, true),
    ]
  })

  return [headers, ...feesRows, emptyRow, emptyRow, ledgerHeaders, ...ledgerRows]
}

export function DownloadClientResume() {
  const documentInfo = useDocumentInfo()

  const client: Client = documentInfo.data as Client

  const [isLoading, setIsLoading] = useState(false)

  const feesRef = useRef<Fee[]>([])

  const handleClickDownloadResume = async () => {
    setIsLoading(true)

    try {
      const mappedData = mapResumeToCSV(client, feesRef.current)
      const csvContent = convertToCSV(mappedData)
      const filename = `cuenta_corriente_${client.business_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`

      downloadCSV(csvContent, filename)
    } catch (error) {
      console.error('Error al descargar la cuenta corriente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)

      try {
        const fees = await sdk.find({
          collection: 'fees',
          pagination: false,
          where: {
            client: {
              equals: documentInfo.id,
            },
          },
        })

        console.log('Fetched fees:', fees)
        feesRef.current = fees.docs

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching fees:', error)
      }
    }

    init()
  }, [])

  return (
    <Button disabled={isLoading} onClick={handleClickDownloadResume}>
      Descargar Cuenta Corriente
    </Button>
  )
}
