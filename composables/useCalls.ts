export const useCalls = () => {
  const calls = useState('calls', () => [])
  const currentPlayingAudio = useState('currentPlayingAudio', () => null)
  const currentPlayingId = useState('currentPlayingId', () => null)
  const selectedCall = useState<TableData | null>('selectedCall', () => null)
  const isLoading = useState('callsIsLoading', () => false)

  const fetchCalls = async () => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/calls')
      calls.value = data.value
    } finally {
      isLoading.value = false
    }
  }

  const stopCurrentAudio = () => {
    if (currentPlayingAudio.value) {
      currentPlayingAudio.value.pause()
      currentPlayingAudio.value = null
      currentPlayingId.value = null
    }
  }

  const togglePlayAudio = (audioUrl: string, id: string) => {
    if (currentPlayingId.value === id) {
      stopCurrentAudio()
      return
    }

    stopCurrentAudio()
    
    const audio = new Audio(audioUrl)
    audio.addEventListener('ended', () => {
      currentPlayingAudio.value = null
      currentPlayingId.value = null
    })
    audio.play()
    currentPlayingAudio.value = audio
    currentPlayingId.value = id
  }

  return {
    calls,
    currentPlayingAudio,
    currentPlayingId,
    selectedCall,
    isLoading,
    fetchCalls,
    stopCurrentAudio,
    togglePlayAudio
  }
}
