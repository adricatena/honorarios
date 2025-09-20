import { HIDE_API_URL } from '@/config'
import { CollectionConfig } from 'payload'

export const Fees: CollectionConfig = {
  slug: 'fees',
  labels: {
    singular: 'Honorario',
    plural: 'Honorarios',
  },
  admin: {
    hideAPIURL: HIDE_API_URL,
  },
  trash: true,
  fields: [
    {
      name: 'client',
      type: 'relationship',
      label: 'Cliente',
      relationTo: 'clients',
      required: true,
      hasMany: false,
    },
    {
      name: 'concepts',
      type: 'relationship',
      label: 'Conceptos',
      relationTo: 'concepts',
      required: true,
      hasMany: true,
    },
    // aside fields
    {
      name: 'period',
      type: 'date',
      label: 'Período',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'MM/yyyy',
        },
      },
    },
    {
      name: 'state',
      type: 'select',
      label: 'Estado',
      options: [
        {
          label: 'Adeudado',
          value: 'due',
        },
        {
          label: 'Pagado',
          value: 'paid',
        },
      ],
      defaultValue: 'due',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
