'client only'
import { payloadSdk } from '@/lib/payload/sdk'
import type { Fee, Variable } from '@/payload-types'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export function useFeeData() {
  const pathname = usePathname()
  const id = useMemo(() => pathname.split('/').at(-1), [pathname])

  const [fee, setFee] = useState<null | Fee>(null)
  const [globals, setGlobals] = useState<null | Variable>(null)
  const [previousFees, setPreviousFees] = useState<Fee[]>([])

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
      setGlobals(globals)
      setPreviousFees(previousFees.docs)
    }
    init()
  }, [])

  return { fee, globals, previousFees }
}
