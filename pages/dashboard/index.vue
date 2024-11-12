<template>
  <div class="dashboard-overview">
    <h1>Dashboard Overview</h1>
    <!-- Summary of recent call activities and key metrics -->
    <div class="metrics">
      <div>Total Calls: {{ totalCalls }}</div>
      <div>Successful Calls: {{ successfulCalls }}</div>
      <div>Dropped Calls: {{ droppedCalls }}</div>
    </div>
    <!-- Quick links to common actions -->
    <div class="quick-links">
      <router-link to="/calls">View Calls</router-link>
      <router-link to="/analytics">View Analytics</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const totalCalls = ref(0);
const successfulCalls = ref(0);
const droppedCalls = ref(0);

// Fetch metrics data from the backend
</script>

<style scoped>
/* Add styles for the dashboard overview page */
</style>
