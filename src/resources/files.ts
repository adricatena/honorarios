import { HIDE_API_URL } from '@/config'
import type { CollectionConfig } from 'payload'

export const Files: CollectionConfig = {
  slug: 'files',
  labels: {
    singular: 'Archivo',
    plural: 'Archivos',
  },
  admin: {
    hideAPIURL: HIDE_API_URL,
  },
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  trash: true,
  fields: [],
}
