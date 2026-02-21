'use client'

import type { Config } from '@/payload-types'
import { PayloadSDK } from '@payloadcms/sdk'
import { Button, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

const sdk = new PayloadSDK<Config>({
  baseURL: '/api',
})

export function DownloadClientResume() {
  const documentInfo = useDocumentInfo()
  console.log('Document Info:', documentInfo)

  const [isLoading, setIsLoading] = useState(false)

  const handleClickDownloadResume = async () => {
    setIsLoading(true)

    setIsLoading(false)
  }

  return (
    <Button disabled={isLoading} onClick={handleClickDownloadResume}>
      Descargar Cuenta Corriente
    </Button>
  )
}
