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
  const callsLimitInit = 30000
  let abortController: AbortController | null = null;

  const fetchCalls = async (startDate, endDate, limit, loadMore = false) => {
    if (abortController) {
      abortController.abort();
    }
  
    abortController = new AbortController();
    const signal = abortController.signal;
  
    let unfilteredResults = [];
    let unfilteredCallTotal = 0;
  
    try {
      isLoading.value = true;
      fetchingProgress.value = 0;

      const totalDates = calculateTotalDates(startDate, endDate);
      const callsLimit = callsLimitInit * totalDates;
  
      const queryParams = buildQueryParams(startDate, endDate, limit || pageSize, loadMore);
      const { data, error } = await fetchData(queryParams, signal);
  
      if (error.value || signal.aborted) return;
  
      const newCalls = data?.value.calls || [];
      if (!loadMore || previousEndDates.value.length === 0) {
        totalCalls.value = parseInt(data?.value.count) || 0;
      }
  
      unfilteredResults = [...newCalls];
      unfilteredCallTotal = data?.value?.rawCallResult?.length || 0;
  
      fetchingProgress.value = calculateProgress(unfilteredCallTotal, totalCalls.value);
  
      endDate = data?.value?.rawCallResult?.[unfilteredCallTotal - 1]?.createdAt

      let isFetchingData = totalCalls.value > calls.value.length && unfilteredCallTotal < callsLimit;
  
      while (isFetchingData) {
        if (signal.aborted) return;
        console.log(pageSize);
        const { data, error } = await fetchData(buildQueryParams(startDate, endDate, pageSize, true), signal);
        if (error.value || signal.aborted) return;
  
        const newCalls = data?.value?.calls || [];
        unfilteredResults.push(...newCalls);
        unfilteredCallTotal += data?.value?.rawCallResult?.length || 0;
  
        fetchingProgress.value = calculateProgress(unfilteredCallTotal, totalCalls.value);
  
        isFetchingData = unfilteredCallTotal < totalCalls.value && unfilteredCallTotal < callsLimit;
        endDate = isFetchingData ? data?.value?.rawCallResult?.[data?.value?.rawCallResult.length - 1]?.createdAt : null;
      }
  
      // Filter and assign calls
      const filteredCalls = filterCalls(unfilteredResults, startDate);
      if (loadMore) {
        calls.value = [...calls.value, ...filteredCalls];
      } else {
        calls.value = filteredCalls;
      }
  
    } finally {
      if (signal.aborted) return;
      isLoading.value = false;
      fetchingProgress.value = 0;
  
      hasMore.value = totalCalls.value > unfilteredCallTotal;
      abortController = null;
    }
  };
  
  const buildQueryParams = (startDate, endDate, limit, loadMore) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (limit) queryParams.append('limit', limit.toString());
    if (loadMore) queryParams.append('loadMore', 'true');
    return queryParams;
  };
  
  const fetchData = async (queryParams, signal) => {
    return await useFetch(`/api/calls?${queryParams.toString()}`, { signal });
  };
  
  const calculateProgress = (unfilteredCallTotal, totalCalls) => {
    return Math.floor((unfilteredCallTotal / totalCalls) * 100);
  };

  const calculateTotalDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const filterCalls = (unfilteredResults, startDate) => {
    if (!startDate) {
      return unfilteredResults.filter((call, index, self) =>
        index === self.findIndex(t => t.id === call.id)
      );
    }
  
    return unfilteredResults.filter((call, index, self) =>
      index === self.findIndex(t => t.id === call.id && new Date(t.createdAt) > new Date(startDate))
    );
  };
  

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
