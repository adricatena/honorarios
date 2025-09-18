import { User } from '@/payload-types'
import type { Access, CollectionConfig } from 'payload'

const read: Access<User> = ({ id, req }) => {
  if (req.user?.dev) return true

  return req.user?.id === id
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read,
  },
  auth: true,
  trash: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: 'dev',
      type: 'checkbox',
      label: 'Desarrollador',
      defaultValue: false,
      admin: {
        hidden: true,
      },
      access: {
        read: ({ req }) => Boolean(req.user?.dev),
      },
    },
  ],
}
