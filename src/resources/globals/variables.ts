import { HIDE_API_URL } from '@/config'
import type { GlobalConfig } from 'payload'

export const Variables: GlobalConfig = {
  slug: 'variables',
  label: 'Variables',
  admin: {
    hideAPIURL: HIDE_API_URL,
  },
  fields: [
    {
      name: 'registration_number',
      type: 'text',
      label: 'Matricula',
      required: true,
    },
    {
      name: 'cuit',
      type: 'text',
      label: 'CUIT',
      required: true,
      minLength: 11,
      maxLength: 11,
    },
    {
      name: 'cbu',
      type: 'text',
      label: 'CBU',
      required: true,
      minLength: 22,
      maxLength: 22,
    },
    {
      name: 'bank_name',
      type: 'text',
      label: 'Nombre del Banco',
      required: true,
    },
    {
      name: 'account_holder',
      type: 'text',
      label: 'Titular de la Cuenta',
      required: true,
    },
    {
      name: 'bank_alias',
      type: 'text',
      label: 'Alias Bancario',
      required: true,
    },
    {
      name: 'invoiceNumber',
      type: 'number',
      label: 'Número de recibo inicial',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: {
        readOnly: true,
      },
    },
  ],
}
