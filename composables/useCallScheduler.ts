import { useState } from '#imports'

export type CallStatus = "queued" | "ringing" | "in-progress" | "forwarding" | "ended"

export const CallStatus = {
  Queued: "queued" as const,
  Ringing: "ringing" as const,
  InProgress: "in-progress" as const,
  Forwarding: "forwarding" as const,
  Ended: "ended" as const,
}

export interface ScheduledCall {
  id: string
  phone: string
  estimatedDuration: number
  status: CallStatus
  tag?: 'Accepted' | 'Rejected' | 'Busy'
  scheduledTime: Date
  priority?: number
  notes?: string
  callWindow?: {
    start: Date
    end: Date
  }
}

export interface SimulationConfig {
  statusWeights: {
    [key in CallStatus]: number
  }
  tagWeights: {
    Accepted: number
    Rejected: number
    Busy: number
  }
  callDurationRange: {
    min: number
    max: number
  }
  timeWindowHours: {
    start: number
    end: number
  }
}

export const useCallScheduler = () => {
  const scheduledCalls = useState<ScheduledCall[]>('scheduledCalls', () => [])
  const isSimulating = useState<boolean>('isSimulating', () => false)
  const simulationConfig = useState<SimulationConfig>('simulationConfig', () => ({
    statusWeights: {
      queued: 0.2,
      ringing: 0.1,
      "in-progress": 0.4,
      forwarding: 0.1,
      ended: 0.2
    },
    tagWeights: {
      Accepted: 0.5,
      Rejected: 0.3,
      Busy: 0.2
    },
    callDurationRange: {
      min: 2,
      max: 5
    },
    timeWindowHours: {
      start: 9, // 9 AM
      end: 17  // 5 PM
    }
  }))
  const selectedAssistant = useState<string>('selectedAssistant', () => '')
  const selectedNumber = useState<string>('selectedNumber', () => '')

  function generatePhoneNumber() {
    return `+65${Math.random().toString().slice(2, 11)}`
  }

  function getRandomByWeight(weights: Record<string, number>) {
    const r = Math.random()
    let sum = 0
    for (const [key, weight] of Object.entries(weights)) {
      sum += weight
      if (r <= sum) return key
    }
    return Object.keys(weights)[0]
  }

  function generateTimeSlots(count: number) {
    const { start, end } = simulationConfig.value.timeWindowHours
    const totalMinutes = (end - start) * 60
    const slotSize = Math.floor(totalMinutes / count)
    
    const baseDate = new Date()
    baseDate.setHours(start, 0, 0, 0)

    return Array.from({ length: count }, (_, i) => {
      const time = new Date(baseDate)
      time.setMinutes(time.getMinutes() + (i * slotSize))
      return time
    })
  }

  function generateMockData(count: number) {
    console.log('Generating mock data with count:', count)
    const timeSlots = generateTimeSlots(count)
    console.log('Generated time slots:', timeSlots)
    const { min, max } = simulationConfig.value.callDurationRange
    console.log('Duration range:', { min, max })

    scheduledCalls.value = Array.from({ length: count }, (_, i) => {
      const mockCall = {
        id: crypto.randomUUID(),
        phone: generatePhoneNumber(),
        estimatedDuration: Math.floor(Math.random() * (max - min + 1)) + min,
        status: CallStatus.Queued,
        scheduledTime: timeSlots[i],
        notes: `Call ID ${i + 1}`,
        callWindow: {
          start: timeSlots[i],
          end: new Date(timeSlots[i].getTime() + (max * 60 * 1000))
        }
      }
      console.log(`Generated mock call ${i + 1}:`, mockCall)
      return mockCall
    })

    console.log('Final scheduled calls:', scheduledCalls.value)
  }

  async function runSimulation() {
    if (isSimulating.value) return
    isSimulating.value = true

    try {
      for (const call of scheduledCalls.value) {
        if (call.status !== CallStatus.Queued) continue

        // Simulate API call
        console.log('Simulating API call...', selectedAssistant.value, selectedNumber.value)
        const result = await $fetch('/api/call', {
          method: 'POST',
          body: {
            phoneNumber: call.phone,
            assistantId: selectedAssistant.value,
            phoneNumberId: selectedNumber.value
          }
        })

        if (result.success) {
          console.log('API call result:', result.data)
          call.status = getRandomByWeight(simulationConfig.value.statusWeights) as ScheduledCall['status']
        } else {
          call.status = CallStatus.Ended
        }

        // Add a small delay between calls
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      isSimulating.value = false
    }
  }

  function clearCalls() {
    scheduledCalls.value = []
  }

  function updateSimulationConfig(config: Partial<SimulationConfig>) {
    simulationConfig.value = {
      ...simulationConfig.value,
      ...config
    }
  }

  return {
    scheduledCalls,
    isSimulating,
    simulationConfig,
    selectedAssistant,
    selectedNumber,
    generateMockData,
    runSimulation,
    clearCalls,
    updateSimulationConfig
  }
}
