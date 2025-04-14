export const useCalls = () => {
  const calls = useState('calls', () => [])
  const currentPlayingAudio = useState('currentPlayingAudio', () => null)
  const currentPlayingId = useState('currentPlayingId', () => null)
  const selectedCall = useState<TableData | null>('selectedCall', () => null)
  const isLoading = useState('callsIsLoading', () => false)
  const hasMore = useState('hasMore', () => false)
  const isExporting = useState('isExporting', () => false)
  const totalCalls = useState('totalCalls', () => 0)
  const pageSize = 1000
  const previousEndDates = useState('previousEndDates', () => [])
  const fetchingProgress = useState('fetchingProgress', () => 0)
  const callsLimit = 30000
  let abortController: AbortController | null = null;

  const fetchCalls = async (startDate?: string, endDate?: string, limit?: number, loadMore?: boolean = false) => {
    if(abortController) {
      abortController.abort()
    }

    abortController = new AbortController();


    const signal = abortController.signal

    try {
      isLoading.value = true
      fetchingProgress.value = 0
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)
      if (limit) queryParams.append('limit', limit.toString())
      if (loadMore) queryParams.append('loadMore', 'true')
      const { data, error } = await useFetch(`/api/calls?${queryParams.toString()}`, { signal })
      if(error.value) {
        return
      }

      if(signal.aborted) {
        return
      }

      const newCalls = data?.value.calls || []


      if(!loadMore || previousEndDates.value.length === 0) {
        totalCalls.value = parseInt(data?.value.count) || 0
      }

      const unfilteredResults = [...newCalls]
      let unfilteredCallTotal = data?.value?.rawCallResult?.length || 0

      fetchingProgress.value = Math.floor((unfilteredCallTotal / totalCalls.value) * 100)

      let isFetchingData = totalCalls.value > calls.value.length && unfilteredCallTotal < callsLimit;
      endDate = data?.value?.rawCallResult?.[unfilteredCallTotal - 1]?.createdAt
      while (isFetchingData) {
        if(signal.aborted) {
          return
        }
        const queryParams = new URLSearchParams()
        if (startDate) queryParams.append('startDate', startDate)
        if (endDate) queryParams.append('endDate', endDate)
        queryParams.append('limit', pageSize.toString())
        queryParams.append('loadMore', 'true')
        const { data, error } = await useFetch(`/api/calls?${queryParams.toString()}`, { signal })

        if(error.value) {
          return
        }

        if(signal.aborted) {
          return
        }

        const newCalls = data?.value?.calls || []
        unfilteredResults.push(...newCalls)
        unfilteredCallTotal += data?.value?.rawCallResult?.length || 0
        isFetchingData = unfilteredCallTotal < totalCalls.value && unfilteredCallTotal < callsLimit;

        const rawCallResult = data?.value?.rawCallResult || []

        if(totalCalls.value < callsLimit) {
          fetchingProgress.value = Math.floor((unfilteredCallTotal / totalCalls.value) * 100)
        } else {
          fetchingProgress.value = Math.floor((unfilteredCallTotal / callsLimit) * 100)
        }

        if(isFetchingData) {
          const lastCall = rawCallResult[rawCallResult.length - 1]
          endDate = lastCall?.createdAt
        } else {
          isFetchingData = false;
        }
      }

      if(!startDate) {
        const newFilteredCalls = unfilteredResults.filter((call, index, self) => 
          index === self.findIndex((t) => (
            t.id === call.id
          ))
        )
        if(loadMore) {
          calls.value = [...calls.value, ...newFilteredCalls]
        } else {
          calls.value = newFilteredCalls;
        }
        return;
      }

      const newFilteredCalls = unfilteredResults.filter((call, index, self) => 
        index === self.findIndex((t) => (
          t.id === call.id && 
          new Date(t.createdAt) > new Date(startDate)
        ))
      )

      if(loadMore) {
        calls.value = [...calls.value, ...newFilteredCalls]
      } else {
        calls.value = newFilteredCalls;
      }
      
    } finally {
      if(signal.aborted) {
        return
      }
      isLoading.value = false;
      fetchingProgress.value = 0;
      hasMore.value = totalCalls.value > calls.value.length;
      abortController = null;
    }
  }

  const fetchRecentCalls = async () => {
    isLoading.value = true
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('limit', "5")
      const { data } = await useFetch(`/api/calls?${queryParams.toString()}`)
      const newCalls = data?.value.calls || []

      calls.value = newCalls
    } catch (error) {
      console.error(error)
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

    const isLoadMore = true;
    const firstCall = calls.value[0]  
    previousEndDates.value.push(firstCall?.createdAt);
    await fetchCalls(startDate, lastCall?.createdAt, pageSize, isLoadMore)
  }

  const loadPrevious = async (endDate?: string) => {
    if (!hasMore.value || isLoading.value || !calls.value.length) return

    const firstCall = calls.value[0]
    if (!firstCall?.createdAt) return

    await fetchCalls(firstCall?.createdAt, previousEndDates.value[previousEndDates.value.length - 1], pageSize)
    previousEndDates.value.pop()
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

  const resetCalls = () => {
    calls.value = []
    hasMore.value = false
  }

  const resetPreviousEndDates = () => {
    previousEndDates.value = []
  }

  const updateCall = async (callId: string, review: string) => {
    const newCall = await $fetch(`/api/call/update/${callId}`, {
      method: 'POST',
      body: {
        name: review
      }
    })
    return newCall
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
    isExporting,
    totalCalls,
    resetCalls,
    loadPrevious,
    resetPreviousEndDates,
    fetchingProgress,
    fetchRecentCalls,
    updateCall
  }
}
