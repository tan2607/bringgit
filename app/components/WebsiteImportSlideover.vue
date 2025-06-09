<template>
  <!-- Website Import Slideover -->
  <USlideover
    v-model="showWebsiteImport"
    :title="t('prompt.import-website')"
  >
    <template #body>
      <div class="space-y-4">
        <UInput
          class="w-full"
          v-model="websiteUrl"
          icon="i-lucide-globe"
          :placeholder="t('prompt.enter-website-url')"
          :disabled="crawling"
        />
        <div v-if="crawledContent" class="mt-4">
          <h4 class="font-medium mb-2">{{ t('prompt.crawled-content') }}</h4>
          <UCard>
            <MDC :value="crawledContent" />
          </UCard>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end w-full items-center space-x-4">
        <UButton  
          color="neutral"
          variant="soft"
          @click="emit('close')"
          :disabled="crawling"
        >
          {{ t('prompt.cancel') }}
        </UButton>
        <UButton
          v-if="crawledContent"
          color="primary"
          @click="importContent"
          :disabled="crawling"
        >
          {{ t('prompt.import') }}
        </UButton>
        <UButton
          v-else
          color="primary"
          :loading="crawling"
          :disabled="!websiteUrl"
          @click="crawlWebsite"
        >
          {{ t('prompt.crawl') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const editedPrompt = useState('promptSlideover.editedPrompt', () => '')
const toast = useToast()
// Website import state
const showWebsiteImport = ref(false)
const websiteUrl = ref('')
const crawledContent = ref('')
const crawling = ref(false)

const { t } = useI18n()
const overlay = useOverlay()

async function crawlWebsite() {
  if (!websiteUrl.value) return

  crawling.value = true
  try {
    const { content } = await $fetch('/api/knowledge/crawl', {
      method: 'POST',
      body: {
        url: websiteUrl.value
      }
    })
    
    crawledContent.value = content
    toast.add({
      title: t('prompt.success'),
      description: t('prompt.website-crawled'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('prompt.error'),
      description: error.message || t('prompt.crawling-failed'),
      color: 'error'
    })
  } finally {
    crawling.value = false
  }
}

function importContent() {
  if (!crawledContent.value) return
  
  editedPrompt.value = editedPrompt.value.trim() + '\n\n' + 
    `# Knowledge from ${websiteUrl.value}\n` + 
    crawledContent.value.trim()
  
  emit('close')
  
  toast.add({
    title: t('prompt.success'),
    description: t('prompt.content-imported'),
    color: 'success'
  })
}

</script>