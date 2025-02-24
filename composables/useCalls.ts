export const useCalls = () => {
  const calls = useState('calls', () => [])
  const currentPlayingAudio = useState('currentPlayingAudio', () => null)
  const currentPlayingId = useState('currentPlayingId', () => null)
  const selectedCall = useState<TableData | null>('selectedCall', () => null)
  const isLoading = useState('callsIsLoading', () => false)
  const hasMore = useState('hasMore', () => true)
  const isExporting = useState('isExporting', () => false)
  const exportProgress = useState('exportProgress', () => 0)
  const pageSize = 250

  const fetchCalls = async (startDate?: string, endDate?: string, limit?: number) => {
    isLoading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)
      if (limit) queryParams.append('limit', limit.toString())
      
      const { data } = await useFetch(`/api/calls?${queryParams.toString()}`)
      const newCalls = data?.value || []
      
      const unfilteredResults = [...calls.value, ...newCalls]

      hasMore.value = newCalls.length >= pageSize

      if(!startDate) {
        calls.value = unfilteredResults.filter((call, index, self) => 
          index === self.findIndex((t) => (
            t.id === call.id
          ))
        )
        return;
      }

      calls.value = unfilteredResults.filter((call, index, self) => 
        index === self.findIndex((t) => (
          t.id === call.id && 
          new Date(t.createdAt) > new Date(startDate)
        ))
      )
      
    } finally {
      isLoading.value = false
    }
  }


  
  const loadMore = async (startDate?: string) => {
    if (!hasMore.value || isLoading.value || !calls.value.length) return

    // Get the createdAt of the last call
    const lastCall = calls.value[calls.value.length - 1]
    if (!lastCall?.createdAt) return

    if (startDate && lastCall?.createdAt && startDate > lastCall.createdAt) {
      hasMore.value = false
    }
    
    await fetchCalls(startDate, lastCall?.createdAt, pageSize + 1)
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

  const exportCalls = async (startDate?: string, endDate?: string) => {
    if (!startDate) return
    
    try {
      isExporting.value = true
      exportProgress.value = 0
      const allCalls = []
      let lastCreatedAt = endDate
      let hasMoreData = hasMore.value ? true : false
      const _pageSize = 500;

      if (!hasMoreData && calls.value.length > 0) return calls.value; // all data already loaded, no need to fetch again
      
      while (hasMoreData) {
        const queryParams = new URLSearchParams()
        if (startDate) queryParams.append('startDate', startDate)
        if (lastCreatedAt) queryParams.append('endDate', lastCreatedAt)
        queryParams.append('limit', (_pageSize + 1).toString())
        
        const { data } = await useFetch(`/api/calls?${queryParams.toString()}`)
        const newCalls = data?.value || []
        
        // Filter duplicates and add to collection
        const uniqueCalls = newCalls.filter(call => 
          !allCalls.some(existing => existing.id === call.id) &&
          new Date(call.createdAt) > new Date(startDate)
        )
        allCalls.push(...uniqueCalls)
        exportProgress.value = allCalls.length
        
        // Check if we have more data to fetch
        if (newCalls.length >= pageSize + 1) {
          // Get the last call's createdAt for next iteration
          const lastCall = newCalls[newCalls.length - 1]
          lastCreatedAt = lastCall.createdAt
        } else {
          hasMoreData = false
        }
      }

      return allCalls
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  const resetCalls = () => {
    calls.value = []
    hasMore.value = true
  }

  return {
    calls,
    currentPlayingAudio,
    currentPlayingId,
    selectedCall,
    isLoading,
    fetchCalls,
    stopCurrentAudio,
    togglePlayAudio,
    loadMore,
    hasMore,
    exportCalls,
    isExporting,
    exportProgress,
    resetCalls,
  }
}
