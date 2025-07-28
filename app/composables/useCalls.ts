export const useCalls = () => {
  const calls = useState("calls", () => []);
  const currentPlayingAudio = useState("currentPlayingAudio", () => null);
  const currentPlayingId = useState("currentPlayingId", () => null);
  const selectedCall = useState<TableData | null>("selectedCall", () => null);
  const isLoading = useState("callsIsLoading", () => false);
  const hasMore = useState("hasMore", () => false);
  const isExporting = useState("isExporting", () => false);
  const totalCalls = useState("totalCalls", () => 0);
  const pageSize = 1000;
  const previousEndDates = useState("previousEndDates", () => []);
  const fetchingProgress = useState("fetchingProgress", () => 0);
  const callsLimitInit = 1000;
  let abortController: AbortController | null = null;

  const fetchCalls = async (startDate: number, endDate: number, limit: number, loadMore = false) => {
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    const signal = abortController.signal;

    try {
      isLoading.value = true;
      fetchingProgress.value = 0;
      calls.value = [];
      totalCalls.value = 0;

      const batchDurationMs = 6 * 60 * 60 * 1000; // 6 hour
      const start = startDate; // already a timestamp
      const end = endDate;

      const totalBatches = Math.ceil((end - start) / batchDurationMs);
      let fetchedCalls: any[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const batchStart = new Date(start + i * batchDurationMs).getTime();
        const batchEnd = new Date(
          Math.min(start + (i + 1) * batchDurationMs, end)
        ).getTime();

        // Exit early if aborted
        if (signal.aborted) return;

        const resp = await fetchData(batchStart, batchEnd, limit, signal);

        if (resp && Array.isArray(resp)) {
          fetchedCalls = [...fetchedCalls, ...resp];

          if (limit && fetchedCalls.length >= limit) {
            fetchedCalls = fetchedCalls.slice(0, limit);
            fetchingProgress.value = 100;
            break;
          }
        }

        // Progress calculation
        fetchingProgress.value = Math.round(((i + 1) / totalBatches) * 100);
      }

      calls.value = sortCalls(fetchedCalls);
      totalCalls.value = fetchedCalls.length;
    } finally {
      if (signal.aborted) return;
      isLoading.value = false;
      fetchingProgress.value = 0;
      abortController = null;
    }
  };
  const fetchData = async (
    startDate: number,
    endDate: number,
    limit: number,
    signal: AbortSignal
  ) => {
    return await $fetch(`/api/calls?startDate=${startDate}&endDate=${endDate}&limit=${limit}`, {
      signal,
    });
  };

  const sortCalls = (calls: any[]) => {
    return calls.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const fetchRecentCalls = async () => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const signal = abortController.signal;
    isLoading.value = true;
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", "5");
      const data = await $fetch(`/api/calls?${queryParams.toString()}`, {
        deep: true,
        signal,
      });
      const newCalls = data || [];

      calls.value = newCalls;
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
      abortController = null;
    }
  };

  const loadMore = async (startDate?: string) => {
    if (!hasMore.value || isLoading.value || !calls.value.length) return;

    // Get the createdAt of the last call
    const lastCall = calls.value[calls.value.length - 1];
    if (!lastCall?.createdAt) return;

    if (startDate && lastCall?.createdAt && startDate > lastCall.createdAt) {
      hasMore.value = false;
    }

    const isLoadMore = true;
    const firstCall = calls.value[0];
    previousEndDates.value.push(firstCall?.createdAt);
    await fetchCalls(startDate, lastCall?.createdAt, pageSize, isLoadMore);
  };

  const loadPrevious = async (endDate?: string) => {
    if (!hasMore.value || isLoading.value || !calls.value.length) return;

    const firstCall = calls.value[0];
    if (!firstCall?.createdAt) return;

    await fetchCalls(
      firstCall?.createdAt,
      previousEndDates.value[previousEndDates.value.length - 1],
      pageSize
    );
    previousEndDates.value.pop();
  };

  const stopCurrentAudio = () => {
    if (currentPlayingAudio.value) {
      currentPlayingAudio.value.pause();
      currentPlayingAudio.value = null;
      currentPlayingId.value = null;
    }
  };

  const togglePlayAudio = (audioUrl: string, id: string) => {
    console.log(audioUrl, id);
    if (currentPlayingId.value === id) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();

    const audio = new Audio(audioUrl);
    audio.addEventListener("ended", () => {
      currentPlayingAudio.value = null;
      currentPlayingId.value = null;
    });
    audio.play();
    currentPlayingAudio.value = audio;
    currentPlayingId.value = id;
  };

  const resetCalls = () => {
    calls.value = [];
    hasMore.value = false;
  };

  const resetPreviousEndDates = () => {
    previousEndDates.value = [];
  };

  const updateCall = async (callId: string, review: string) => {
    const newCall = await $fetch(`/api/call/update/${callId}`, {
      method: "POST",
      body: {
        name: review,
      },
    });
    return newCall;
  };

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
    updateCall,
  };
};
