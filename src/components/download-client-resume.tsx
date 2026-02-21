'use client'
import type { Client, Config, Fee } from '@/payload-types'
import { convertToCSV, downloadCSV } from '@/utils/csv'
import { PayloadSDK } from '@payloadcms/sdk'
import { Button, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

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

  // Mock ledger rows
  const ledgerRows = [
    ['', '', '', '', '', '', '01/01/2025', 'Saldo inicial', '', '', '$ 797.881,53'],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '01/01/2025',
      'Honorarios 12-2025',
      '$ 131.000,00',
      '',
      '$ 928.881,53',
    ],
    ['', '', '', '', '', '', '05/01/2025', 'pago', '', '$ -', '$ 928.881,53'],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '01/02/2025',
      'Honorarios 01-2026',
      '$ 131.000,00',
      '',
      '$ 1.059.881,53',
    ],
  ]

  return [headers, ...feesRows, emptyRow, emptyRow, ledgerHeaders, ...ledgerRows]
}

export function DownloadClientResume() {
  const documentInfo = useDocumentInfo()
  console.log('Document Info:', documentInfo)

  const [isLoading, setIsLoading] = useState(false)

  const handleClickDownloadResume = async () => {
    setIsLoading(true)

    try {
      // Mock data
      const mockClient: Client = {
        id: '1',
        business_name: 'TROCELLO MARCOS ANTONIO MARIA',
        cuit: '20-18007501-2',
        address: 'Calle Falsa 123',
        vat_condition: 'responsable_inscripto',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      const mockFees: Fee[] = [
        {
          id: '1',
          client: mockClient,
          period: '2026-01-01T00:00:00.000Z',
          state: 'due',
          concepts: [
            {
              concept: {
                id: '1',
                name: 'Honorarios TROCELLO MARCOS',
                price: 131000,
                updatedAt: '',
                createdAt: '',
              },
              price: 131000,
            },
          ],
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
        {
          id: '2',
          client: mockClient,
          period: '2025-12-01T00:00:00.000Z',
          state: 'due',
          concepts: [
            {
              concept: {
                id: '1',
                name: 'Honorarios TROCELLO MARCOS',
                price: 131000,
                updatedAt: '',
                createdAt: '',
              },
              price: 131000,
            },
          ],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: '3',
          client: mockClient,
          period: '2025-11-01T00:00:00.000Z',
          state: 'due',
          concepts: [
            {
              concept: {
                id: '1',
                name: 'Honorarios TROCELLO MARCOS',
                price: 131000,
                updatedAt: '',
                createdAt: '',
              },
              price: 131000,
            },
            {
              concept: {
                id: '2',
                name: 'Honorarios TROCELLO MARCOS',
                price: 666881.53,
                updatedAt: '',
                createdAt: '',
              },
              price: 666881.53,
            },
          ],
          createdAt: '2025-12-01T00:00:00.000Z',
          updatedAt: '2025-12-01T00:00:00.000Z',
        },
      ]

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mappedData = mapResumeToCSV(mockClient, mockFees)
      const csvContent = convertToCSV(mappedData)
      const filename = `cuenta_corriente_${mockClient.business_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`

      downloadCSV(csvContent, filename)
    } catch (error) {
      console.error('Error al descargar la cuenta corriente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button disabled={isLoading} onClick={handleClickDownloadResume}>
      Descargar Cuenta Corriente
    </Button>
  )
}
