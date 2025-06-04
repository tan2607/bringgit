import { ref, shallowRef } from 'vue'

export function usePlayer() {
  const isPlaying = ref(false)
  const audioContext = shallowRef<AudioContext | null>(null)
  const source = shallowRef<AudioBufferSourceNode | null>(null)
  const audioElement = shallowRef<HTMLAudioElement | null>(null)

  async function stop() {
    if (source.value) {
      source.value.stop()
      source.value.disconnect()
      source.value = null
    }
    if (audioContext.value) {
      await audioContext.value.close()
      audioContext.value = null
    }
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.src = ''
      audioElement.value = null
    }
    isPlaying.value = false
  }

  async function playArrayBuffer(buffer: ArrayBuffer) {
    const blob = new Blob([buffer], { type: 'audio/mpeg' })
    const url = URL.createObjectURL(blob)
    
    audioElement.value = new Audio(url)
    audioElement.value.onended = () => {
      isPlaying.value = false
      URL.revokeObjectURL(url)
    }
    audioElement.value.onerror = (e) => {
      console.error('Audio playback error:', e)
      isPlaying.value = false
      URL.revokeObjectURL(url)
    }
    
    try {
      await audioElement.value.play()
      isPlaying.value = true
    } catch (error) {
      console.error('Failed to play audio:', error)
      isPlaying.value = false
      URL.revokeObjectURL(url)
    }
  }

  async function playStream(stream: ReadableStream) {
    // Stop any existing playback
    await stop()

    // Create new audio context
    audioContext.value = new AudioContext()
    let nextStartTime = audioContext.value.currentTime
    const reader = stream.getReader()
    let leftover = new Uint8Array()
    
    try {
      isPlaying.value = true
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        // Combine leftover data with new data
        const data = new Uint8Array(leftover.length + value.length)
        data.set(leftover)
        data.set(value, leftover.length)

        // Create audio buffer
        const audioBuffer = audioContext.value.createBuffer(
          1,
          data.length,
          audioContext.value.sampleRate
        )
        audioBuffer.copyToChannel(new Float32Array(data.buffer), 0)

        // Create and play buffer source
        source.value = audioContext.value.createBufferSource()
        source.value.buffer = audioBuffer
        source.value.connect(audioContext.value.destination)
        source.value.start(nextStartTime)

        nextStartTime += audioBuffer.duration
      }
    } catch (error) {
      console.error('Stream playback error:', error)
    } finally {
      isPlaying.value = false
      reader.releaseLock()
    }
  }

  async function play(data: ReadableStream | ArrayBuffer, callback?: () => void) {
    try {
      if (data instanceof ReadableStream) {
        await playStream(data)
      } else if (data instanceof ArrayBuffer) {
        await playArrayBuffer(data)
      } else {
        throw new Error('Unsupported audio data type')
      }
      callback?.()
    } catch (error) {
      console.error('Playback error:', error)
      isPlaying.value = false
    }
  }

  return {
    isPlaying,
    play,
    stop
  }
}
