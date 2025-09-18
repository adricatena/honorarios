import { HIDE_API_URL } from '@/config'
import { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: {
    singular: 'Cliente',
    plural: 'Clientes',
  },
  admin: {
    hideAPIURL: HIDE_API_URL,
  },
  auth: true,
  trash: true,
  fields: [],
}
