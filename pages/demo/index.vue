<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center">{{ t('demos') }}</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard 
        v-for="demo in demos" 
        :key="demo.to"
        :title="demo.label"
        :description="demo.description"
        :ui="{ 
          base: 'hover:shadow-lg transition-all duration-300 ease-in-out',
          header: { base: 'p-4 border-b' },
          body: { base: 'p-4' }
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold">{{ demo.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ demo.description }}</p>
            </div>
            <UIcon :name="demo.icon" class="w-8 h-8 text-primary" />
          </div>
        </template>
        
        <UButton 
          :label="t('explore')" 
          :to="demo.to" 
          block 
          variant="outline"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const demos = [
  {
    label: t('voice-translation'),
    description: t('multilingual-voice-translation'),
    icon: 'i-lucide-languages',
    to: '/demo/translation'
  },
  // Add more demos here in the future
]
</script>

<style scoped>
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
</style>
