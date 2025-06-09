<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Search Section -->
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold mb-6">How can we help you?</h1>
      <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search for help articles..."
        class="max-w-xl mx-auto" />
    </div>

    <!-- Quick Links -->
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <UCard v-for="link in quickLinks" :key="link.title">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon :name="link.icon" class="text-2xl" />
            <h3 class="font-semibold">{{ link.title }}</h3>
          </div>
        </template>
        <p class="text-gray-600">{{ link.description }}</p>
        <template #footer>
          <UButton color="primary" variant="ghost" :to="link.path" class="w-full">
            Learn More
          </UButton>
        </template>
      </UCard>
    </div>

    <!-- Help Categories -->
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Tutorials and Guides -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Tutorials and Guides</h2>
        <UCard>
          <UAccordion :items="tutorials" />
        </UCard>
      </div>

      <!-- FAQs -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <UCard>
          <UAccordion :items="faqs" />
        </UCard>
      </div>
    </div>

    <!-- Contact Support -->
    <div class="mt-12 text-center">
      <h2 class="text-xl font-semibold mb-4">Still need help?</h2>
      <p class="mb-6 text-gray-600">
        Our support team is available 24/7 to assist you
      </p>

      <!-- Support Dialog -->
      <UModal :open="isModalOpen" :title="'Contact Support'"
        description="Submit your question and we'll get back to you as soon as possible." :close="false">

        <UButton color="primary" size="lg" @click="isModalOpen = true">
          Contact Support
        </UButton>

        <template #body>
          <UForm :schema="supportFormSchema" :state="supportForm" class="space-y-4" @submit="submitSupportRequest">
            <UFormField label="Subject" name="subject">
              <UInput v-model="supportForm.subject" class="w-full" />
            </UFormField>

            <UFormField label="Message" name="message">
              <UTextarea v-model="supportForm.message" autoresize :maxrows="10" class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-2 mt-4">
              <UButton label="Cancel" color="neutral" variant="outline" @click="isModalOpen = false" />
              <UButton type="submit" label="Submit" color="neutral" />
            </div>
          </UForm>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const searchQuery = ref('');

const supportFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type SupportFormSchema = z.output<typeof supportFormSchema>

const supportForm = reactive<Partial<SupportFormSchema>>({
  subject: undefined,
  message: undefined
})

const toast = useToast()

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using the dashboard',
    icon: 'i-lucide-compass',
    path: '/help/getting-started'
  },
  {
    title: 'Call Management',
    description: 'Everything about managing your calls',
    icon: 'i-lucide-phone',
    path: '/help/call-management'
  },
  {
    title: 'Analytics Guide',
    description: 'Understanding your call analytics',
    icon: 'i-lucide-bar-chart',
    path: '/help/analytics'
  }
];

const tutorials = [
  {
    label: 'Dashboard Overview',
    content: `Learn how to navigate the dashboard and use its key features:
    - Understanding the main metrics
    - Customizing your view
    - Quick actions and shortcuts`,
    icon: 'i-lucide-layout-dashboard'
  },
  {
    label: 'Scheduling Calls',
    content: `Complete guide to call scheduling:
    - Creating new schedules
    - Managing call queues
    - Setting up recurring calls
    - Handling time zones`,
    icon: 'i-lucide-calendar'
  },
  {
    label: 'Managing Tags',
    content: `Everything about call tagging:
    - Creating and editing tags
    - Bulk tagging calls
    - Using tags for filtering
    - Tag-based analytics`,
    icon: 'i-lucide-tag'
  },
  {
    label: 'Downloading Reports',
    content: `Learn about report generation:
    - Available report types
    - Customizing report content
    - Export formats
    - Automated reporting`,
    icon: 'i-lucide-file-down'
  }
];

const faqs = [
  {
    label: 'How do I schedule a call?',
    content: 'Navigate to the scheduling section and click "New Schedule"...'
  },
  {
    label: 'How can I download call recordings?',
    content: 'Open the call details page and click the download button...'
  },
  {
    label: 'How do I manage user permissions?',
    content: 'In the admin settings, you can assign roles and permissions...'
  }
];

const isModalOpen = ref(false);

const submitSupportRequest = async (event: FormSubmitEvent<SupportFormSchema>) => {
  const result = await supportFormSchema.safeParseAsync(supportForm)

  if (!result.success) {
    return
  }

  toast.add({
    title: 'Success',
    description: 'Your support request has been submitted.',
    color: 'success'
  })

  supportForm.subject = undefined
  supportForm.message = undefined
  isModalOpen.value = false
}
</script>

<style scoped>
/* Add styles for the help center page */
</style>
