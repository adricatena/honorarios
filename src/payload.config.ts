// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { es } from 'payload/i18n/es'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { BASE_URL, DATABASE_URI, N8N_URL, PAYLOAD_SECRET } from './config'
import { storagePlugin } from './plugins/storage'
import { Clients } from './resources/clients'
import { Concepts } from './resources/concepts'
import { Fees } from './resources/fees'
import { Files } from './resources/files'
import { Variables } from './resources/globals/variables'
import { Users } from './resources/users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    avatar: 'default',
    theme: 'light',
    dateFormat: 'dd/MM/yyyy',
    // Metainformación completa del admin panel
    meta: {
      titleSuffix: '| Honorarios',
      description: 'Sistema de gestión de honorarios',
      keywords: 'honorarios, facturación, gestión, clientes, conceptos',
      openGraph: {
        title: 'Honorarios - Panel de Administración',
        description: 'Sistema de gestión de honorarios Leandro Lopez',
        siteName: 'Honorarios',
        type: 'website',
      },
    },
    components: {
      graphics: {
        Logo: '/brand/logo#Logo',
      },
    },
  },
  collections: [Users, Files, Clients, Concepts, Fees],
  globals: [Variables],
  editor: lexicalEditor(),
  secret: PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: DATABASE_URI,
  }),
  sharp,
  plugins: [payloadCloudPlugin(), storagePlugin],
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: {
      es,
    },
  },
  cors: [BASE_URL, N8N_URL],
  csrf: [BASE_URL, N8N_URL],
})
