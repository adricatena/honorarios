import { HIDE_API_URL } from '@/config'
import type { Fee } from '@/payload-types'
import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

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
// si el estado cambio a "paid" y no tiene numero de comprobante, asignar el ultimo numero de comprobante + 1
const beforeChangeUpdateInvoiceNumber: CollectionBeforeChangeHook<Fee> = async ({ req, data }) => {
  if (data?.state === 'paid' && !data?.invoiceNumber) {
    const globals = await req.payload.findGlobal({
      slug: 'variables',
    })

    const lastInvoiceNumber = globals?.invoiceNumber || 0
    const newInvoiceNumber = lastInvoiceNumber + 1

    data.invoiceNumber = newInvoiceNumber

    await req.payload.updateGlobal({
      slug: 'variables',
      data: {
        invoiceNumber: newInvoiceNumber,
      },
    })
  }

  return data
}
const beforeChangeNormalizePeriod: CollectionBeforeChangeHook<Fee> = async ({ data }) => {
  if (data?.period) {
    const date = new Date(data.period)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    // Formatear directamente en UTC con hora fija 12:00:00
    data.period = `${year}-${month}-01T12:00:00.000+00:00`
  }

  return data
}
const beforeChangeDefaultConcepts: CollectionBeforeChangeHook<Fee> = async ({ data, req }) => {
  if (data?.client && (!data?.concepts || data.concepts.length === 0)) {
    const client =
      typeof data.client === 'string'
        ? await req.payload.findByID({
            collection: 'clients',
            id: data.client,
          })
        : data.client

    if (client?.concepts && client.concepts.length > 0) {
      const variables = await req.payload.findGlobal({
        slug: 'variables',
      })
      const conceptsData = await Promise.all(
        client.concepts.map(async (conceptRel) => {
          const concept =
            typeof conceptRel === 'string'
              ? await req.payload.findByID({
                  collection: 'concepts',
                  id: conceptRel,
                })
              : conceptRel

          let price = concept?.price || 0
          if (concept?.byModules) {
            price += (concept?.modulesAmount || 0) * (variables.modulePrice || 1)
          }

          return {
            concept: concept.id,
            price,
          }
        }),
      )

      data.concepts = conceptsData
    }
  }
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
    components: {
      beforeListTable: ['/components/fees-exports#FeesExports'],
      views: {
        edit: {
          honorario: {
            tab: {
              Component: '/components/download-pdf-fee#DownloadPdfFee',
            },
          },
        },
      },
    },
  },
  hooks: {
    beforeChange: [
      beforeChange,
      beforeChangeUpdateInvoiceNumber,
      beforeChangeNormalizePeriod,
      beforeChangeDefaultConcepts,
    ],
  },
  trash: true,
  fields: [
    /* {
      type: 'ui',
      name: 'comprobante',
      label: 'Comprobante',
      admin: {
        condition: () => NODE_ENV !== 'production',
        width: '100%',
        components: {
          Field: '/components/viewer-pdf-comprobante#ViewerPdfComprobante',
        },
        disableListColumn: true,
      },
    },
    {
      type: 'ui',
      name: 'honorarios',
      label: 'Honorarios',
      admin: {
        condition: () => NODE_ENV !== 'production',
        width: '100%',
        components: {
          Field: '/components/viewer-pdf-fee#ViewerPdfFee',
        },
        disableListColumn: true,
      },
    }, */
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
      admin: {
        condition: (data) => Boolean(data?.client),
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
      /* hooks: {
        afterChange: [afterChangeFeeState],
      }, */
    },
    {
      name: 'paymentDate',
      type: 'date',
      label: 'Fecha de Pago',
      required: false,
      admin: {
        position: 'sidebar',
        date: {
          displayFormat: 'dd/MM/yyyy',
        },
        condition: (data) => data?.state === 'paid',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Método de Pago',
      options: [
        {
          label: 'Efectivo',
          value: 'cash',
        },
        {
          label: 'Transferencia Bancaria',
          value: 'bank_transfer',
        },
      ],
      required: false,
      admin: {
        position: 'sidebar',
        condition: (data) => data?.state === 'paid',
      },
    },
    {
      name: 'invoiceNumber',
      type: 'number',
      label: 'Número de Comprobante',
      required: false,
      min: 1,
      admin: {
        position: 'sidebar',
        condition: (data) => data?.state === 'paid',
        readOnly: true,
      },
    },
    // hidden fields
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      admin: {
        hidden: true,
        disableListColumn: true,
      },
    },
  ],
}
