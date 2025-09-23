import { HIDE_API_URL } from '@/config'
import { Fee } from '@/payload-types'
import { APIError, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

// si ya existe un honorario para el mismo cliente y período, lanzar error
const beforeChange: CollectionBeforeChangeHook<Fee> = async ({
  operation,
  req,
  data,
  originalDoc,
}) => {
  if (!data.client || !data.period) {
    throw new APIError('El cliente y el período son obligatorios.', 400, null, true)
  }

  const client =
    typeof data.client === 'string'
      ? await req.payload.findByID({
          collection: 'clients',
          id: data.client,
        })
      : data.client

  const date = new Date(data.period)
  const period = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`

  data.title = `${client.business_name} - ${period}`

  const { docs, totalDocs } = await req.payload.find({
    collection: 'fees',
    where: {
      and: [
        {
          client: {
            equals: data.client,
          },
        },
        {
          period: {
            equals: data.period,
          },
        },
      ],
    },
  })

  if (totalDocs < 1) {
    return data
  }

  if (operation === 'create') {
    throw new APIError('Ya existe un honorario para este cliente y período.', 400, null, true)
  }

  const existing = docs.some((fee) => fee.id !== originalDoc?.id)
  if (existing) {
    throw new APIError('Ya existe un honorario para este cliente y período.', 400, null, true)
  }

  return data
}

export const Fees: CollectionConfig = {
  slug: 'fees',
  labels: {
    singular: 'Honorario',
    plural: 'Honorarios',
  },
  admin: {
    hideAPIURL: HIDE_API_URL,
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [beforeChange],
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
      type: 'array',
      label: 'Conceptos',
      labels: {
        singular: 'Concepto',
        plural: 'Conceptos',
      },
      fields: [
        {
          name: 'concept',
          type: 'relationship',
          label: 'Concepto',
          relationTo: 'concepts',
          required: true,
          hasMany: false,
        },
        {
          name: 'price',
          type: 'number',
          label: 'Precio',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
      ],
    },
    {
      name: 'observations',
      type: 'textarea',
      label: 'Observaciones',
      required: false,
      admin: {
        description: 'Información adicional sobre el honorario.',
        placeholder: 'Escribe aquí cualquier información adicional sobre el honorario...',
        rows: 4,
      },
    },
    /* {
      name: 'concepts',
      type: 'relationship',
      label: 'Conceptos',
      relationTo: 'concepts',
      required: true,
      hasMany: true,
    }, */
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
    // hidden fields
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      admin: {
        hidden: true,
      },
    },
  ],
}
