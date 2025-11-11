'use client'
import { payloadSdk } from '@/lib/payload/sdk'
import type { Fee, Variable } from '@/payload-types'
import { Button } from '@payloadcms/ui'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { HonorariosPDF } from './honorarios-pdf'

const BUTTON_TEXT = 'Descargar PDF'

export function DownloadPdfFee() {
  const pathname = usePathname()
  const id = useMemo(() => pathname.split('/').at(-1), [pathname])

  const [fee, setFee] = useState<null | Fee>(null)
  const [previousFees, setPreviousFees] = useState<Fee[]>([])
  const [globals, setGlobals] = useState<null | Variable>(null)

  useEffect(() => {
    const init = async () => {
      if (!id) return

      const data = await payloadSdk.findByID({
        collection: 'fees',
        id,
      })
      const previousFees = await payloadSdk.find({
        collection: 'fees',
        where: {
          and: [
            {
              client: {
                equals: typeof data.client === 'string' ? data.client : data.client.id,
              },
            },
            {
              state: {
                equals: 'due',
              },
            },
            {
              period: {
                less_than: data.period,
              },
            },
            {
              id: {
                not_equals: id,
              },
            },
          ],
        },
      })
      const globals = await payloadSdk.findGlobal({
        slug: 'variables',
      })
      setFee(data)
      setPreviousFees(previousFees.docs)
      setGlobals(globals)
    }
    init()
  }, [])

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
