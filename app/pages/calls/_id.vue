<template>
  <div class="call-details-page">
    <h1>Call Details</h1>
    <!-- Call information -->
    <div class="call-info">
      <div>Caller: {{ call.caller }}</div>
      <div>Recipient: {{ call.recipient }}</div>
      <div>Date: {{ call.date }}</div>
      <div>Duration: {{ call.duration }}</div>
    </div>
    <!-- Call transcript -->
    <div class="call-transcript">
      <h2>Transcript</h2>
      <p>{{ call.transcript }}</p>
    </div>
    <!-- Call summary -->
    <div class="call-summary">
      <h2>Summary</h2>
      <p>{{ call.summary }}</p>
    </div>
    <!-- Tags -->
    <div class="call-tags">
      <h2>Tags</h2>
      <ul>
        <li v-for="tag in call.tags" :key="tag">{{ tag }}</li>
      </ul>
    </div>
    <!-- Voice recording playback -->
    <div class="call-recording">
      <h2>Recording</h2>
      <audio :src="call.recordingUrl" controls></audio>
      <a :href="call.recordingUrl" download>Download Recording</a>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const call = ref({});

onMounted(() => {
  const callId = route.params.id;
  // Fetch call details from the backend using callId
});
</script>

<style scoped>
/* Add styles for the call details page */
</style>
