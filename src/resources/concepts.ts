import { HIDE_API_URL } from '@/config'
import type { Concept } from '@/payload-types'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

const beforeChangeModulesPrice: CollectionBeforeChangeHook<Concept> = async ({ req, data }) => {
  if (!data?.byModules) {
    data.modulesPrice = 0
    data.totalPrice = data.price
    return data
  }

  const variables = await req.payload.findGlobal({
    slug: 'variables',
  })

  data.modulesPrice = (variables.modulePrice || 1) * (data?.modulesAmount || 0)
  data.totalPrice = (data.price || 0) + data.modulesPrice

  return data
}

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
  hooks: {
    beforeChange: [beforeChangeModulesPrice],
  },
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
      name: 'modules',
      type: 'array',
      label: 'Detalles',
      labels: {
        singular: 'Detalle',
        plural: 'Detalles',
      },
      required: false,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nombre',
          required: true,
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
    // aside fields
    {
      name: 'byModules',
      type: 'checkbox',
      label: 'Por módulos',
      required: false,
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Indica si el concepto se cobra por módulos o es un precio fijo.',
      },
    },
    {
      name: 'modulesAmount',
      type: 'number',
      label: 'Cantidad de módulos',
      required: false,
      defaultValue: 0.0,
      admin: {
        position: 'sidebar',
        description: 'Cantidad de módulos (si aplica).',
        condition: (data) => data?.byModules === true,
        step: 0.01,
      },
    },
    {
      name: 'modulesPrice',
      type: 'number',
      label: 'Precio calculado por módulos',
      required: false,
      defaultValue: 0.0,
      admin: {
        position: 'sidebar',
        description: 'Precio calculado en base a la cantidad de módulos y el precio por módulo.',
        readOnly: true,
        step: 0.01,
      },
    },
    {
      name: 'totalPrice',
      type: 'number',
      label: 'Precio total',
      required: false,
      defaultValue: 0.0,
      admin: {
        position: 'sidebar',
        description: 'Precio total del concepto (precio base + precio por módulos).',
        readOnly: true,
        step: 0.01,
      },
    },
  ],
}
