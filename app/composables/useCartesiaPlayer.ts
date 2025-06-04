import { ref } from 'vue'
import { WebPlayer, Source } from "@cartesia/cartesia-js"

const SAMPLE_RATE = 24000;

export function useCartesiaPlayer() {
  const isPlaying = ref(false)
  let player: WebPlayer | null = null
  let source: Source | null = null

  async function play(arrayBuffer: ArrayBuffer) {
    try {
      console.log(`Playing audio buffer of length ${arrayBuffer.byteLength}`);
      

      const audioBuffer = new Float32Array(arrayBuffer);
      const bufferDuration = audioBuffer.length / SAMPLE_RATE;
      
      if (player) stop();
      
      source = new Source({
        sampleRate: SAMPLE_RATE,
        encoding: 'pcm_f32le',
        container: 'raw'
      });
      await source.enqueue(audioBuffer);
      await source.close();
      
      player = new WebPlayer({ bufferDuration });
      isPlaying.value = true;
      await player.play(source);
    } catch (error) {
      console.error('[Cartesia Player] Error:', error)
    } finally {
      isPlaying.value = false
      player = null
      source = null
    }
  }

  function stop() {
    if (source) {
      source.close()
      source = null
    }
    if (player) {
      player.stop()
      player = null
    }
    isPlaying.value = false
  }

  return {
    isPlaying,
    play,
    stop
  }
}
