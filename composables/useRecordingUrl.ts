export const useRecordingUrl = () => {
  const transformRecordingUrl = (originalUrl: string) => {
    if (!originalUrl) return ''
    const host = window.location.host
    const protocol = window.location.protocol
    const path = originalUrl.replace('https://storage.vapi.ai/', '')
    return `${protocol}//${host}/api/recording/${path}`
  }

  return {
    transformRecordingUrl
  }
}
