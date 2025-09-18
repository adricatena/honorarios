import { R2_ACCESS_KEY_ID, R2_BUCKET, R2_ENDPOINT, R2_SECRET_ACCESS_KEY } from '@/config'
import { Files } from '@/resources/files'
import { s3Storage } from '@payloadcms/storage-s3'

const endpoint = R2_ENDPOINT
const accessKeyId = R2_ACCESS_KEY_ID
const secretAccessKey = R2_SECRET_ACCESS_KEY
const bucket = R2_BUCKET

export const storagePlugin = s3Storage({
  collections: {
    [Files.slug]: {
      prefix: 'files',
    },
  },
  config: {
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  },
  bucket,
})
