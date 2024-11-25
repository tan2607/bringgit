export interface Language {
  code: string
  name: string
}

export const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'ms', name: 'Bahasa Melayu (Malay)' },
  { code: 'id', name: 'Bahasa Indonesia (Indonesian)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ar', name: 'العربية (Arabic)' }
]

export const getLanguageIcon = (code: string): string => {
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
