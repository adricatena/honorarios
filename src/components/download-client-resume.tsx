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
  const formatCurrency = (val: number, showZero = false) => {
    if (val === 0 && !showZero) return ''
    return `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`
  }

  // Calcular movimientos para la cuenta corriente
  const movements: { date: Date; description: string; debe: number; haber: number }[] = []

  fees.forEach((fee) => {
    const total =
      fee.concepts?.reduce((sum, item) => {
        return sum + (item.price || 0)
      }, 0) || 0

    // Cargo por honorarios (Debe)
    const periodStr = new Date(fee.period).toLocaleDateString('es-AR', {
      month: '2-digit',
      year: 'numeric',
    })
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

  // Calcular saldo final antes de armar las filas
  let saldo = 0
  for (const fee of fees) {
    const total = fee.concepts?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
    saldo += total
    if (fee.state === 'paid') saldo -= total
  }

  const today = new Date().toLocaleDateString('es-AR')

  // Sección destacada del saldo actual
  const summaryRows = [
    [`CUENTA CORRIENTE - ${client.business_name.toUpperCase()}`, '', '', '', ''],
    [`Al ${today}`, '', '', '', ''],
    ['', '', '', '', ''],
    ['SALDO ACTUAL:', '', '', '', formatCurrency(saldo, true)],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ]

  // Headers en mayúsculas
  const headers = ['FECHA', client.business_name.toUpperCase(), 'DEBE', 'HABER', 'SALDO']

  // Calcular saldos fila por fila
  let runingSaldo = 0
  const ledgerRows = movements.map((m) => {
    runingSaldo += m.debe - m.haber
    return [
      m.date.toLocaleDateString('es-AR'),
      m.description,
      formatCurrency(m.debe),
      formatCurrency(m.haber),
      formatCurrency(runingSaldo, true),
    ]
  })

  return [...summaryRows, headers, ...ledgerRows]
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
