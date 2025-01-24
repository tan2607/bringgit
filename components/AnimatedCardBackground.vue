<template>
  <div class="animated-bg" :data-active="isActive" :style="backgroundStyle">
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="100%"
      height="100%"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient :id="'grad-' + props.assistantId" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :style="{ 'stop-color': colors[0], 'stop-opacity': '0.06' }" />
          <stop offset="50%" :style="{ 'stop-color': colors[1], 'stop-opacity': '0.6' }" />
          <stop offset="100%" :style="{ 'stop-color': colors[2], 'stop-opacity': '0.2' }" />
        </linearGradient>
        <path
          :id="'wave-path-' + props.assistantId"
          class="wave-path"
          :fill="'url(#grad-' + props.assistantId + ')'"
          :d="wavePathD"
        />
      </defs>
      <g>
        <use 
          :href="'#wave-path-' + props.assistantId"
          opacity="0.3"
          :style="{
            filter: props.isActive ? 'brightness(1.3) saturate(1.4) contrast(1.1)' : 'none',
          }"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            :dur="props.isActive ? '2s' : '4s'"
            calcMode="spline"
            :values="wavePhases[0]"
            keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1"
            keySplines="0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9"
            repeatCount="indefinite"
          />
        </use>
        <use 
          :href="'#wave-path-' + props.assistantId"
          opacity="0.6"
          :style="{
            filter: props.isActive ? 'brightness(1.3) saturate(1.4) contrast(1.1)' : 'none',
          }"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            :dur="props.isActive ? '2.5s' : '5s'"
            calcMode="spline"
            :values="wavePhases[1]"
            keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1"
            keySplines="0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9"
            repeatCount="indefinite"
          />
        </use>
        <use 
          :href="'#wave-path-' + props.assistantId"
          opacity="0.9"
          :style="{
            filter: props.isActive ? 'brightness(1.3) saturate(1.4) contrast(1.1)' : 'none',
          }"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            :dur="props.isActive ? '3s' : '6s'"
            calcMode="spline"
            :values="wavePhases[2]"
            keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1"
            keySplines="0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9;
                       0.3, 0.1, 0.3, 0.9"
            repeatCount="indefinite"
          />
        </use>
      </g>
    </svg>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  assistantId: string
  isActive?: boolean
}>()

// Compute wave path with smooth transition
const wavePathD = computed(() => {
  const baseY = 502.589
  // Increased amplitudes even more
  const amplitude = props.isActive ? 281.997 : 181.997
  const offset1 = props.isActive ? 278.998 : 178.998
  const offset2 = props.isActive ? 279.278 : 179.278
  const offset3 = props.isActive ? 288.368 : 188.368
  const peakY = props.isActive ? 224.995 : 124.995

  return `M-363.852,${baseY}c0,0,236.988-${amplitude},505.475,0s371.981,${offset1},575.971,0s293.985-${offset2},505.474,5.859s493.475,${offset3},716.963-${peakY}v560.106H-363.852V${baseY}z`
})

// Seeded random number generator
function seededRandom(seed: string, index: number = 0) {
  let hash = 0
  const combinedSeed = seed + index.toString()
  for (let i = 0; i < combinedSeed.length; i++) {
    hash = ((hash << 5) - hash) + combinedSeed.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  // Create a decimal between 0 and 1
  const random = Math.abs((Math.sin(hash) * 10000) % 1)
  return random
}

// Generate random phases for each wave
const wavePhases = computed(() => {
  const phases = []
  for (let i = 0; i < 3; i++) {
    const rand = (index: number) => seededRandom(props.assistantId, i * 12 + index)
    
    // Generate 6 points for smoother movement
    const points = []
    for (let j = 0; j < 6; j++) {
      // Add slight variation to movement pattern
      const progress = j / 5 // 0 to 1
      const angleOffset = progress * Math.PI * 2
      
      // Use sine waves for more natural oscillation
      const xScale = rand(j * 2) * 100 + 200 // 200-300 range
      const x = Math.round(Math.sin(angleOffset) * xScale)
      
      // Vertical movement follows a similar pattern but offset
      const yScale = rand(j * 2 + 1) * 60 + 40 // 40-100 range
      const y = 215 + Math.round(Math.sin(angleOffset + rand(j + 10) * Math.PI) * yScale)
      
      points.push(`${x} ${y}`)
    }
    
    // Make sure the last point matches the first for seamless loop
    points[5] = points[0]
    
    phases.push(points.join(';'))
  }
  return phases
})

// Generate unique IDs for SVG elements
const gradientId = computed(() => `gradient-${props.assistantId}`)
const waveId = computed(() => `wave-${props.assistantId}`)

// Generate colors based on assistant ID with complementary accent
const colors = computed(() => {
  const baseHue = seededRandom(props.assistantId) * 360
  return [
    generateColor(props.assistantId, 0, 0.08), // Background wave - slightly more opaque
    generateColor(props.assistantId, 3, 0.7),  // Main wave - more vibrant
    generateColor(props.assistantId, 6, 0.3)   // Accent wave - more noticeable
  ]
})

function generateColor(seed: string, offset: number, alpha: number) {
  // Use the seed to determine the color palette type
  const paletteType = Math.floor(seededRandom(seed) * 5)
  
  let hue: number
  let saturation: number
  let lightness: number

  switch (paletteType) {
    case 0: // Blue spectrum (original)
      hue = generateRandomInRange(seed, 190, 250, offset)
      saturation = generateRandomInRange(seed, 60, 90, offset + 1)
      lightness = generateRandomInRange(seed, 40, 70, offset + 2)
      break
    case 1: // Purple to Pink
      hue = generateRandomInRange(seed, 270, 330, offset)
      saturation = generateRandomInRange(seed, 50, 80, offset + 1)
      lightness = generateRandomInRange(seed, 45, 65, offset + 2)
      break
    case 2: // Teal to Cyan
      hue = generateRandomInRange(seed, 160, 200, offset)
      saturation = generateRandomInRange(seed, 55, 85, offset + 1)
      lightness = generateRandomInRange(seed, 35, 65, offset + 2)
      break
    case 3: // Green to Emerald
      hue = generateRandomInRange(seed, 120, 160, offset)
      saturation = generateRandomInRange(seed, 40, 70, offset + 1)
      lightness = generateRandomInRange(seed, 40, 60, offset + 2)
      break
    case 4: // Warm (Orange to Rose)
      hue = generateRandomInRange(seed, 20, 60, offset)
      saturation = generateRandomInRange(seed, 65, 95, offset + 1)
      lightness = generateRandomInRange(seed, 45, 65, offset + 2)
      break
    default:
      hue = generateRandomInRange(seed, 190, 250, offset)
      saturation = generateRandomInRange(seed, 60, 90, offset + 1)
      lightness = generateRandomInRange(seed, 40, 70, offset + 2)
  }

  // Add slight hue variation for each layer while keeping it in the same family
  const hueVariation = generateRandomInRange(seed, -15, 15, offset + 3)
  hue = (hue + hueVariation + 360) % 360

  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
}

function generateRandomInRange(seed: string, min: number, max: number, offset = 0) {
  return min + (seededRandom(seed + offset.toString()) * (max - min))
}

// Generate opacities
const opacities = computed(() => [
  generateRandomInRange(props.assistantId, 0.4, 0.6, 9),   // Increased base opacity further
  generateRandomInRange(props.assistantId, 0.7, 0.9, 10),  // Increased middle opacity
  generateRandomInRange(props.assistantId, 0.9, 1.0, 11)   // Maximum top opacity
])

// Generate durations (faster animations)
const durations = computed(() => [
  generateRandomInRange(props.assistantId, 6, 8, 12),   // Was 8-12
  generateRandomInRange(props.assistantId, 4, 6, 13),   // Was 6-10
  generateRandomInRange(props.assistantId, 2, 4, 14)    // Was 4-8
])

// Generate animation values
const animationValues = computed(() => [
  `${generateRandomInRange(props.assistantId, 250, 290, 15)} ${generateRandomInRange(props.assistantId, 220, 240, 16)}; 
   ${generateRandomInRange(props.assistantId, -350, -320, 17)} ${generateRandomInRange(props.assistantId, 170, 190, 18)}; 
   ${generateRandomInRange(props.assistantId, 250, 290, 19)} ${generateRandomInRange(props.assistantId, 220, 240, 20)}`,
  `${generateRandomInRange(props.assistantId, -290, -250, 21)} ${generateRandomInRange(props.assistantId, 220, 240, 22)};
   ${generateRandomInRange(props.assistantId, 223, 263, 23)} ${generateRandomInRange(props.assistantId, 210, 230, 24)};
   ${generateRandomInRange(props.assistantId, -290, -250, 25)} ${generateRandomInRange(props.assistantId, 220, 240, 26)}`,
  `${generateRandomInRange(props.assistantId, -20, 20, 27)} ${generateRandomInRange(props.assistantId, 220, 240, 28)};
   ${generateRandomInRange(props.assistantId, -160, -120, 29)} ${generateRandomInRange(props.assistantId, 190, 210, 30)};
   ${generateRandomInRange(props.assistantId, -20, 20, 31)} ${generateRandomInRange(props.assistantId, 220, 240, 32)}`
])

// Generate keyTimes
const keyTimes = computed(() => [
  "0; .5; 1",
  "0; .6; 1",
  "0; .4; 1"
])

// Adjust background gradient to complement the wave colors
const backgroundStyle = computed(() => {
  const paletteType = Math.floor(seededRandom(props.assistantId) * 5)
  let darkColor, lightColor

  switch (paletteType) {
    case 0: // Blue
      darkColor = generateColor(props.assistantId, 33, 0.95)
      lightColor = generateColor(props.assistantId, 34, 0.85)
      break
    case 1: // Purple
      darkColor = 'hsla(280, 60%, 20%, 0.95)'
      lightColor = generateColor(props.assistantId, 34, 0.85)
      break
    case 2: // Teal
      darkColor = 'hsla(180, 70%, 15%, 0.95)'
      lightColor = generateColor(props.assistantId, 34, 0.85)
      break
    case 3: // Green
      darkColor = 'hsla(150, 50%, 15%, 0.95)'
      lightColor = generateColor(props.assistantId, 34, 0.85)
      break
    case 4: // Warm
      darkColor = 'hsla(30, 70%, 15%, 0.95)'
      lightColor = generateColor(props.assistantId, 34, 0.85)
      break
    default:
      darkColor = generateColor(props.assistantId, 33, 0.95)
      lightColor = generateColor(props.assistantId, 34, 0.85)
  }

  return {
    backgroundColor: darkColor,
    backgroundImage: `linear-gradient(to bottom, ${darkColor}, ${lightColor})`
  }
})
</script>

<style scoped>
.animated-bg {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  aspect-ratio: 16/9;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0.5rem;
  pointer-events: all;
}

.animated-bg svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5),
               0 0 30px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.content :slotted(*) {
  pointer-events: auto;
  position: relative;
  z-index: 2;
  text-align: center;
  font-size: min(4rem, 16vw, 16vh);
  line-height: 1;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animated-bg[data-active="true"] .content {
  transform: scale(1.05) translateY(-5%);
  text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.6),
               0 0 40px rgba(0, 0, 0, 0.4);
}

.animated-bg[data-active="true"] .content :slotted(*) {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.8) 0%, 
    rgba(255,255,255,1) 50%, 
    rgba(255,255,255,0.8) 100%);
  background-size: 200% auto;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  animation: shine 2s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}
</style>
