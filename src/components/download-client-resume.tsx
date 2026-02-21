'use client'

import type { Config } from '@/payload-types'
import { PayloadSDK } from '@payloadcms/sdk'
import { Button, useDocumentInfo } from '@payloadcms/ui'

const sdk = new PayloadSDK<Config>({
  baseURL: '/api',
})

export function DownloadClientResume() {
  const documentInfo = useDocumentInfo()
  console.log('Document Info:', documentInfo)

  return <Button>Descargar Cuenta Corriente</Button>
}
