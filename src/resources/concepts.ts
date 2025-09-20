import { HIDE_API_URL } from '@/config'
import { CollectionConfig } from 'payload'

export const Concepts: CollectionConfig = {
  slug: 'concepts',
  labels: {
    singular: 'Concepto',
    plural: 'Conceptos',
  },
  admin: {
    hideAPIURL: HIDE_API_URL,
    useAsTitle: 'name',
  },
  trash: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nombre',
          required: true,
          unique: true,
          index: true,
        },
        {
          name: 'price',
          type: 'number',
          label: 'Precio',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
      required: false,
      admin: {
        description: 'Descripción del concepto.',
        placeholder: 'Escribe aquí una descripción del concepto...',
        rows: 4,
      },
    },
  ],
}
