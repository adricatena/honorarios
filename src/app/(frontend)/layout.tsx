import React from 'react'

export const metadata = {
  description: 'Sistema de Honorarios - Leando Lopez',
  title: 'Honorarios',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
