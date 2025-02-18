import { utils, writeFile } from 'xlsx'

export const useExcel = () => {
  // Function to sanitize text for Excel
  const sanitizeForExcel = (text: string) => {
    if (!text) return ''
    // Prevent formula injection by prefixing with single quote if text starts with =, +, -, @, tab, or carriage return
    if (/^[=+\-@\t\r]/.test(text)) {
      return `'${text}`
    }
    return text
  }

  const exportToExcel = <T extends Record<string, any>>(
    data: T[],
    options: {
      filename: string
      sheetName?: string
      transformData?: (item: T) => Record<string, any>
    }
  ) => {
    const { filename, sheetName = 'Sheet1', transformData } = options
    
    const exportData = transformData 
      ? data.map(transformData)
      : data.map(item => 
          Object.keys(item).reduce((acc, key) => ({
            ...acc,
            [key]: sanitizeForExcel(String(item[key]))
          }), {})
        )

    const worksheet = utils.json_to_sheet(exportData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, sheetName)

    writeFile(workbook, filename)
  }

  return {
    sanitizeForExcel,
    exportToExcel
  }
}
