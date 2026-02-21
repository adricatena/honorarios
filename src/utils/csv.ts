// Función para convertir datos a CSV
export function convertToCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Escapar comillas dobles y envolver en comillas si contiene punto y coma, saltos de línea o comillas
          const cellStr = String(cell ?? '')
          if (cellStr.includes(';') || cellStr.includes('\n') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(';'),
    )
    .join('\n')
}

// Función para descargar el CSV
export function downloadCSV(csvContent: string, filename: string): void {
  const BOM = '\uFEFF' // BOM para que Excel reconozca UTF-8
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
