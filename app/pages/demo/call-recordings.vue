<template>
  <div class="container mx-auto p-4">
    <UBreadcrumb :links="breadcrumbs" />
    
    <h1 class="text-2xl font-bold mt-4 mb-6">Call Recordings</h1>
    
    <div class="mb-6">
      <p class="text-gray-600">
        This page demonstrates the integration with RingCentral API to fetch and play call recordings.
        You can use the mock data option to see how it works without actual RingCentral credentials.
      </p>
    </div>
    
    <CallRecordings />
    
    <div class="mt-8 bg-gray-50 p-4 rounded-lg">
      <h2 class="text-lg font-semibold mb-2">Setup Instructions</h2>
      <p class="mb-2">To use this feature with real RingCentral data, add the following environment variables:</p>
      <UCard class="mb-4">
        <pre class="text-sm text-gray-700">
RINGCENTRAL_CLIENT_ID=your_client_id
RINGCENTRAL_CLIENT_SECRET=your_client_secret
RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com
RINGCENTRAL_USERNAME=your_phone_number
RINGCENTRAL_EXTENSION=your_extension
RINGCENTRAL_PASSWORD=your_password</pre>
      </UCard>
      <p>You can get these credentials by creating an app in the RingCentral Developer Console.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define breadcrumbs for navigation
const breadcrumbs = [
  {
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    label: 'Demo',
    to: '/demo'
  },
  {
    label: 'Call Recordings',
    to: '/demo/call-recordings'
  }
]
</script>
