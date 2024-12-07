import { readdirSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import en from './locales/en'
import ar from './locales/ar'
import id from './locales/id'
import ja from './locales/ja'
import ko from './locales/ko'
import ms from './locales/ms'
import th from './locales/th'
import vi from './locales/vi'
import zh_hans from './locales/zh_hans'
import zh_hant from './locales/zh_hant'

interface LocaleReport {
  language: string
  missingKeys: string[]
  extraKeys: string[]
}

interface I18nUsageReport {
  unusedKeys: string[]
  undefinedKeys: string[]
}

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).reduce((keys: string[], [key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return [...keys, ...getAllKeys(value, currentKey)]
    }
    return [...keys, currentKey]
  }, [])
}

function isValidI18nKey(key: string): boolean {
  // Exclude CSS classes
  if (key.includes(':')) {
    const [prefix] = key.split(':')
    if (['sm', 'md', 'lg', 'xl', '2xl'].includes(prefix)) {
      return false
    }
  }

  // Exclude UI component names
  if (key.startsWith('U') && /^U[A-Z][a-zA-Z]+$/.test(key)) {
    return false
  }

  // Exclude long sentences (likely help text or documentation)
  if (key.split(' ').length > 5 || key.includes('...')) {
    return false
  }

  // Exclude common false positives
  const falsePositives = ['a', 'T', 'ghost', 'subtle']
  if (falsePositives.includes(key)) {
    return false
  }

  return true
}

function extractI18nKeys(content: string): string[] {
  const keys: string[] = []
  // Enhanced regex patterns to catch more i18n usage patterns
  const patterns = [
    /(?:\$?t|useI18n\(\)\.t)\(['"](.*?)['"][\),]/g,  // t('key') or $t('key') or useI18n().t('key')
    /(?:v-t|\:t)=['"](.*?)['"]/g,                     // v-t="'key'" or :t="'key'"
    /t:\s*['"](.*?)['"]/g,                            // t: 'key'
    /\{\{\s*(?:\$t|t)\(['"](.*?)['"][\),]\s*\}\}/g   // {{ t('key') }} or {{ $t('key') }}
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && !match[1].includes('${') && isValidI18nKey(match[1])) {
        keys.push(match[1])
      }
    }
  }

  return [...new Set(keys)]
}

function readVueFiles(directory: string): string[] {
  const keys: string[] = []
  
  function readDir(dir: string) {
    const files = readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = join(dir, file.name)
      
      if (file.isDirectory()) {
        readDir(fullPath)
      } else if (file.name.endsWith('.vue')) {
        const content = readFileSync(fullPath, 'utf-8')
        keys.push(...extractI18nKeys(content))
      }
    }
  }
  
  readDir(directory)
  return keys
}

function validateI18nUsage(): I18nUsageReport {
  const projectRoot = resolve(__dirname, '..')
  const dirsToSearch = [
    join(projectRoot, 'components'),
    join(projectRoot, 'pages'),
    join(projectRoot, 'layouts'),
    join(projectRoot, 'composables'),
    join(projectRoot, 'plugins')
  ]
  
  // Get all i18n keys used in Vue files
  const usedKeys = dirsToSearch.reduce((keys: string[], dir) => {
    try {
      return [...keys, ...readVueFiles(dir)]
    } catch (error) {
      // Directory might not exist, skip it
      return keys
    }
  }, [])
  
  // Get all keys defined in English locale
  const definedKeys = new Set(getAllKeys(en))
  
  // Find keys that are defined but not used
  const unusedKeys = [...definedKeys].filter(key => !usedKeys.includes(key))
  
  // Find keys that are used but not defined
  const undefinedKeys = usedKeys.filter(key => !definedKeys.has(key))
  
  return {
    unusedKeys,
    undefinedKeys
  }
}

function printI18nUsageReport(report: I18nUsageReport): void {
  console.log('\n=== English Locale Usage Analysis ===\n')
  
  const totalDefined = new Set(getAllKeys(en)).size
  const totalUsed = report.unusedKeys.length + (new Set(report.undefinedKeys).size)
  
  console.log(`Statistics:`)
  console.log(`- Total keys defined in English locale: ${totalDefined}`)
  console.log(`- Keys used in components: ${totalUsed}`)
  console.log(`- Usage ratio: ${((totalUsed / totalDefined) * 100).toFixed(1)}%\n`)
  
  if (report.undefinedKeys.length > 0) {
    console.log('\nKeys used in components but missing from English locale:')
    console.log('(These should be added to the English locale file)\n')
    const grouped = report.undefinedKeys.reduce((acc: Record<string, string[]>, key) => {
      const category = key.split('.')[0] || 'general'
      acc[category] = acc[category] || []
      acc[category].push(key)
      return acc
    }, {})
    
    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, keys]) => {
        console.log(`${category}:`)
        keys.sort().forEach(key => console.log(`  - ${key}`))
      })
  }
  
  if (report.unusedKeys.length > 0) {
    console.log('\nKeys defined in English locale but not used in components:')
    console.log('(Consider removing these if they are no longer needed)\n')
    const grouped = report.unusedKeys.reduce((acc: Record<string, string[]>, key) => {
      const category = key.split('.')[0] || 'general'
      acc[category] = acc[category] || []
      acc[category].push(key)
      return acc
    }, {})
    
    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, keys]) => {
        console.log(`${category}:`)
        keys.sort().forEach(key => console.log(`  - ${key}`))
      })
  }
}

// Run only the English locale analysis
const usageReport = validateI18nUsage()
printI18nUsageReport(usageReport)

export { validateI18nUsage, printI18nUsageReport, I18nUsageReport }
