export const {
  PAYLOAD_SECRET = '',
  DATABASE_URI = '',
  R2_ENDPOINT = '',
  R2_ACCESS_KEY_ID = '',
  R2_SECRET_ACCESS_KEY = '',
  R2_BUCKET = '',
  NODE_ENV,
} = process.env

export const HIDE_API_URL = NODE_ENV === 'production'
