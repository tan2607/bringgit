export function useApi() {
  function getCallsOverTime(dateRange) {
    // Mock data for calls over time
    return Promise.resolve([
      { date: '2023-10-01', calls: 120 },
      { date: '2023-10-02', calls: 150 },
      { date: '2023-10-03', calls: 90 },
      { date: '2023-10-04', calls: 200 },
      { date: '2023-10-05', calls: 170 },
      { date: '2023-10-06', calls: 130 },
      { date: '2023-10-07', calls: 160 },
      // ...additional mock data...
    ])
  }

  function getCallOutcomes(dateRange) {
    // Mock data for call outcomes
    return Promise.resolve([
      { outcome: 'Successfully Connected', count: 510 },
      { outcome: 'Already Called', count: 245 },
      { outcome: 'Busy/Call Back Later', count: 189 },
      { outcome: 'No Response', count: 156 },
      { outcome: 'Wrong Number', count: 134 },
      // ...additional mock data...
    ])
  }

  // ...other API methods if needed...

  return { getCallsOverTime, getCallOutcomes }
}
