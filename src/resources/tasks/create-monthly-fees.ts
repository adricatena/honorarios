import { Client, Concept } from '@/payload-types'
import { TaskConfig } from 'payload'

export const CreateMonthlyFees: TaskConfig<'create-monthly-fees'> = {
  slug: 'create-monthly-fees',
  label: 'Crear honorarios mensuales',
  schedule: [
    {
      queue: 'monthly-fees',
      cron: '0 0/1 * * * *', // cada 10 minutos, en el segundo 0
    },
  ],
  inputSchema: [],
  outputSchema: [
    {
      name: 'message',
      type: 'text',
      required: false,
    },
  ],
  handler: async ({ req }) => {
    console.log('Handler de create-monthly-fees ejecutado')

    const activeClients = await req.payload.find({
      collection: 'clients',
      pagination: false,
      where: {
        active: { equals: true },
      },
    })

    const TODAY = new Date()
    const firstDayOfMonth = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
    const firstDayNextMonth = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1)

    const filteredClients: Client[] = []
    for (const client of activeClients.docs) {
      const { totalDocs } = await req.payload.find({
        collection: 'fees',
        where: {
          and: [
            { client: { equals: client.id } },
            { period: { greater_than_equal: firstDayOfMonth.toISOString() } },
            { period: { less_than: firstDayNextMonth.toISOString() } },
          ],
        },
        pagination: false,
      })

      if (totalDocs === 0) {
        filteredClients.push(client)
      }
    }

    console.log(`Clientes activos: ${activeClients.totalDocs}`)
    console.log(`Clientes sin honorarios este mes: ${filteredClients.length}`)

    const promises = filteredClients.map((client) => {
      return req.payload.create({
        collection: 'fees',
        data: {
          client: client.id,
          state: 'due',
          concepts: (client.concepts as Concept[]).map((concept) => ({
            concept: concept.id,
            price: concept.price,
          })),
          period: TODAY.toISOString(),
        },
      })
    })
    await Promise.all(promises)

    console.log(
      `Se han creado ${filteredClients.length} honorarios para ${TODAY.toLocaleTimeString(
        'es-AR',
      )}.`,
    )

    return {
      output: {
        message: `Se han creado ${filteredClients.length} honorarios para ${TODAY.toLocaleTimeString(
          'es-AR',
        )}.`,
      },
    }
  },
}
