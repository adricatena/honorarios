export const {
  PAYLOAD_SECRET = '',
  DATABASE_URI = '',
  R2_ENDPOINT = '',
  R2_ACCESS_KEY_ID = '',
  R2_SECRET_ACCESS_KEY = '',
  R2_BUCKET = '',
  NODE_ENV,
  BASE_URL = '',
} = process.env

export const HIDE_API_URL = NODE_ENV === 'production'

// PROD: every first day of month at 03:00 AM
// DEV: every 9 minutes, at second 0
export const JOBS_CRON = NODE_ENV === 'production' ? '0 0 3 1 * *' : '0 0/1 * * * *'

// PROD: every first day of month at 02:00 AM
// DEV: cada 10 minutos, en el segundo 0
export const CREATE_MONTHLY_FEES_CRON = NODE_ENV === 'production' ? '0 0 2 1 * *' : '0 0/1 * * * *'
