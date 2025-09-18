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
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'cuit',
          type: 'text',
          label: 'CUIT',
          required: true,
          unique: true,
          index: true,
        },
        {
          name: 'vat_condition',
          type: 'select',
          label: 'Condición frente al IVA',
          required: true,
          options: [
            {
              label: 'Responsable Inscripto',
              value: 'responsable_inscripto',
            },
            {
              label: 'Monotributista',
              value: 'monotributista',
            },
          ],
          defaultValue: 'responsable_inscripto',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Teléfono',
          required: false,
        },
      ],
    },
    {
      name: 'business_name',
      type: 'text',
      label: 'Razón Social',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      label: 'Domicilio',
      required: true,
    },
  ],
}
