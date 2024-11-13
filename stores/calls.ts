import { defineStore } from 'pinia'

export const useCallsStore = defineStore('calls', {
  state: () => ({
    calls: [],
    currentPlayingAudio: null,
    currentPlayingId: null,
    selectedCall: null,
    isModalOpen: false,
    isLoading: false
  }),

  actions: {
    async fetchCalls() {
      this.isLoading = true
      try {
        const { data } = await useFetch('/api/calls')
        this.calls = data.value
      } finally {
        this.isLoading = false
      }
    },

    stopCurrentAudio() {
      if (this.currentPlayingAudio) {
        this.currentPlayingAudio.pause()
        this.currentPlayingAudio = null
        this.currentPlayingId = null
      }
    },

    togglePlayAudio(audioUrl, id) {
      if (this.currentPlayingId === id) {
        this.stopCurrentAudio()
        return
      }

      this.stopCurrentAudio()
      
      const audio = new Audio(audioUrl)
      audio.addEventListener('ended', () => {
        this.currentPlayingAudio = null
        this.currentPlayingId = null
      })
      audio.play()
      this.currentPlayingAudio = audio
      this.currentPlayingId = id
    }
  },

  getters: {
    filteredCalls: (state) => (startDate, endDate, status) => {
      let filtered = state.calls || []

      if (startDate && endDate) {
        filtered = filtered.filter(call => {
          const callDate = new Date(call.startedAt)
          return callDate >= new Date(startDate) && 
                 callDate <= new Date(endDate)
        })
      }

      if (status) {
        filtered = filtered.filter(call => call.status === status)
      }

      return filtered
    }
  }
})