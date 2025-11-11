'client only'

import { BASE_URL } from '@/config'
import type { Config } from '@/payload-types'
import { PayloadSDK } from '@payloadcms/sdk'

// Pass your config from generated types as generic
export const payloadSdk = new PayloadSDK<Config>({
  baseURL: `${BASE_URL}/api`,
})
