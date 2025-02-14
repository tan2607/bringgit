export const useAnalytics = () => {
  const timeRangeInfo = useState<{ start?: string, end?: string }>('timeRangeInfo', () => ({
    start: undefined,
    end: undefined
  }))
  const stats = useState('analyticsStats', () => [
    { label: 'Total Calls', value: '', change: 0 },
    { label: 'Average Duration', value: '', change: -2 },
    { label: 'Total Assistants', value: '', change: 5 },
    { label: 'Total Jobs', value: '', change: 8 }
  ])
  const callsOverTimeData = useState('callsOverTimeData', () => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Number of Calls',
      data: [65, 78, 90, 81, 56, 45, 70],
      fill: false,
      borderColor: '#36A2EB',
      tension: 0.1
    }]
  }))
  const callOutcomesData = useState('callOutcomesData', () => ({
    labels: ['Answered', 'No Answer', 'Busy', 'Failed', 'Voicemail'],
    datasets: [{
      data: [45, 25, 15, 10, 5],
      backgroundColor: [
        '#4BC0C0',
        '#FF6384',
        '#FFCE56',
        '#9966FF',
        '#36A2EB'
      ]
    }]
  }))
  const tagData = useState('tagData', () => [
    { tag: 'Already Called', count: 245, percentage: '19.8%' },
    { tag: 'Busy/Call Back Later', count: 189, percentage: '15.3%' },
    { tag: 'No Response', count: 156, percentage: '12.6%' },
    { tag: 'Wrong Number', count: 134, percentage: '10.9%' },
    { tag: 'Successfully Connected', count: 510, percentage: '41.4%' }
  ])
  const isLoading = useState('analyticsIsLoading', () => false)
  const error = useState('analyticsError', () => null)
  const timeGrouping = useState('timeGrouping', () => 'daily')
  const timeGroupingOptions = useState('timeGroupingOptions', () => [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ])
  const chartOptions = useState('chartOptions', () => ({
    responsive: true
  }))

  const tagChartData = computed(() => {
    return {
      labels: tagData.value.map(item => item.tag),
      datasets: [{
        data: tagData.value.map(item => item.count),
        backgroundColor: [
          '#4BC0C0',
          '#FF6384',
          '#FFCE56',
          '#9966FF',
          '#36A2EB'
        ]
      }]
    }
  })

  const fetchAnalytics = async () => {
    isLoading.value = true
    try {
      const response = await useFetch('/api/analytics', {lazy: true})
      if (response.data.value) {
        let [calls] = response.data.value.calls?.result || []

        timeRangeInfo.value = response.data.value.calls?.timeRange!

        // Total Calls
        stats.value[0].value = calls?.countId || '';
        
        // Average Duration
        const totalSeconds = Math.floor(calls?.avgDuration * 60 || 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        stats.value[1].value = `${minutes}m ${seconds}s`;
        
        // Assistants
        const { fetchAssistants } = useAssistants()
        const assistants = await fetchAssistants()
        stats.value[2].value = assistants.length;

        // Jobs
        stats.value[3].value = response.data.value.jobs;
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e)
    } finally {
      isLoading.value = false
    }
  }

  const updateTimeGrouping = (grouping: string) => {
    timeGrouping.value = grouping
    fetchAnalytics()
  }

  return {
    timeRangeInfo,
    stats,
    callsOverTimeData,
    callOutcomesData,
    tagData,
    isLoading,
    error,
    timeGrouping,
    timeGroupingOptions,
    chartOptions,
    tagChartData,
    fetchAnalytics,
    updateTimeGrouping
  }
}
