import type { LocaleObject } from '@nuxt/i18n/dist/runtime/composables'

export const availableLocales: LocaleObject[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr' },
  { code: 'th', name: 'ไทย', dir: 'ltr' },
  { code: 'ms', name: 'Bahasa Melayu', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' }
]

export const getLocaleIcon = (code: string): string => {
  const iconMap: Record<string, string> = {
    'ar': 'i-circle-flags-sa',
    'en': 'i-circle-flags-us',
    'id': 'i-circle-flags-id',
    'ja': 'i-circle-flags-jp',
    'ko': 'i-circle-flags-kr',
    'ms': 'i-circle-flags-my',
    'th': 'i-circle-flags-th',
    'vi': 'i-circle-flags-vn',
    'zh': 'i-circle-flags-cn',
    'zh_hans': 'i-circle-flags-cn',
    'zh_hant': 'i-circle-flags-tw',
    'hi': 'i-circle-flags-in'
  }
  return iconMap[code] || 'i-circle-flags-un'
}
