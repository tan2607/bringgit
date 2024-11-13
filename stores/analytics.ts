import { defineStore } from 'pinia'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    timeRangeInfo: null,
    stats: [
      { label: 'Total Calls', value: '', change: 0 },
      { label: 'Total Cost', value: '', change: 5 },
      { label: 'Average Duration', value: '', change: -2 },
      { label: 'Average Cost', value: '', change: 8 }
    ],
    callsOverTimeData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Number of Calls',
        data: [65, 78, 90, 81, 56, 45, 70],
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.1
      }]
    },
    callOutcomesData: {
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
    },
    tagData: [
      { tag: 'Already Called', count: 245, percentage: '19.8%' },
      { tag: 'Busy/Call Back Later', count: 189, percentage: '15.3%' },
      { tag: 'No Response', count: 156, percentage: '12.6%' },
      { tag: 'Wrong Number', count: 134, percentage: '10.9%' },
      { tag: 'Successfully Connected', count: 510, percentage: '41.4%' }
    ],
    isLoading: false,
    error: null,
    timeGrouping: 'daily',
    timeGroupingOptions: [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' }
    ],
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Chart Title'
        }
      }
    },
    tagChartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  }),

  getters: {
    tagChartData: (state) => ({
      labels: state.tagData.map(item => item.tag),
      datasets: [{
        data: state.tagData.map(item => parseFloat(item.percentage)),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    })
  },

  actions: {
    async fetchAnalytics() {
      this.isLoading = true
      try {
        const response = await useFetch('/api/analytics')
        if (response.data.value) {
          let [calls] = response.data.value.calls?.result
          this.timeRangeInfo = response.data.value.calls.timeRange
          
          this.stats[0].value = calls.countId
          this.stats[1].value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calls.sumCost)

          const totalSeconds = Math.floor(calls.avgDuration * 60)
          const minutes = Math.floor(totalSeconds / 60)
          const seconds = totalSeconds % 60
          this.stats[2].value = `${minutes}m ${seconds}s`
          this.stats[3].value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calls.avgCost)
        }
      } catch (e) {
        this.error = 'Failed to fetch analytics'
        console.error('Failed to fetch analytics:', e)
      } finally {
        this.isLoading = false
      }
    },
    updateTimeGrouping(grouping) {
      this.timeGrouping = grouping
      // TODO: Fetch new data based on grouping
    }
  }
})