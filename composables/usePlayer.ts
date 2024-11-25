import { ref, shallowRef } from 'vue'

export function usePlayer() {
  const isPlaying = ref(false)
  const audioContext = shallowRef<AudioContext | null>(null)
  const source = shallowRef<AudioBufferSourceNode | null>(null)

  async function play(stream: ReadableStream, callback?: () => void) {
    // Stop any existing playback
    stop()

    // Create new audio context with 24kHz sample rate
    audioContext.value = new AudioContext({ sampleRate: 24000 })

    let nextStartTime = audioContext.value.currentTime
    const reader = stream.getReader()
    let leftover = new Uint8Array()
    let result = await reader.read()
    isPlaying.value = true

    while (!result.done && audioContext.value) {
      // Combine leftover data with new data
      const data = new Uint8Array(leftover.length + result.value.length)
      data.set(leftover)
      data.set(result.value, leftover.length)

      // Ensure data length is divisible by 4
      const length = Math.floor(data.length / 4) * 4
      const remainder = data.length % 4
      const buffer = new Float32Array(data.buffer, 0, length / 4)

      // Save remainder for next iteration
      leftover = new Uint8Array(data.buffer, length, remainder)

      // Create audio buffer
      const audioBuffer = audioContext.value.createBuffer(
        1,
        buffer.length,
        audioContext.value.sampleRate
      )
      audioBuffer.copyToChannel(buffer, 0)

      // Create and play buffer source
      source.value = audioContext.value.createBufferSource()
      source.value.buffer = audioBuffer
      source.value.connect(audioContext.value.destination)
      source.value.start(nextStartTime)

      // Update next start time
      nextStartTime += audioBuffer.duration

      // Read next chunk
      result = await reader.read()

      // Handle end of stream
      if (result.done) {
        source.value.onended = () => {
          stop()
          callback?.()
        }
      }
    }
  }

  function stop() {
    // Close audio context and reset state
    audioContext.value?.close()
    audioContext.value = null
    isPlaying.value = false
  }

  return {
    isPlaying,
    play,
    stop
  }
}
