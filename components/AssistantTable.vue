<template>
  <div>
    <div class="flex items-center justify-between px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
      <div>
        <!-- Filter Section -->
        <UInput v-model="searchFilter" class="max-w-sm mr-4" placeholder="Filter by name..." icon="i-lucide-search" />

        <!-- Column Visibility Dropdown -->
        <UDropdownMenu v-if="viewMode === 'table'" :items="table?.tableApi
          ?.getAllColumns()
          .filter((column) => ['id', 'voice', 'model'].includes(column.id))
          .map((column) => ({
            label: upperFirst(column.id),
            type: 'checkbox' as const,
            checked: column.getIsVisible(),
            onUpdateChecked(checked: boolean) {
              table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
            },
            onSelect(e?: Event) {
              e?.preventDefault()
            }
          }))" :content="{ align: 'end' }">
          <UButton label="Columns" color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" />
        </UDropdownMenu>

      </div>

      <!-- View Mode Toggle -->
      <URadioGroup class="float-right" v-model="viewMode" :items="[
        { label: 'Cards', value: 'cards' },
        { label: 'Table', value: 'table' },
      ]" />
    </div>

    <!-- Table View -->
    <UTable v-if="viewMode === 'table'" ref="table" v-model:column-visibility="columnVisibility"
      v-model:column-filters="columnFilters" :data="filteredData" :columns="columns" :loading="isLoading" class="flex-1"
      :ui="{
        tr: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
      }" @row-select="(row: any) => openEditSlideover(row.original)">
      <template #loading-state>
        <div class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>
      </template>
    </UTable>

    <!-- Card View -->
    <div v-else class="p-4">
      <UBlogPosts class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UBlogPost v-for="assistant in filteredData" :key="assistant.id"
          :description="assistant.meta?.description || assistant.firstMessage" :authors="[{
            name: assistant.meta?.name || assistant.name,
            description: formatTimeAgo(new Date(assistant.createdAt))
          }]" class="card-hover-effect">
          <template #header>
            <AnimatedCardBackground :assistant-id="assistant.id" :is-active="hoveredAssistantId === assistant.id"
              class="cursor-pointer" @mouseenter="hoveredAssistantId = assistant.id"
              @mouseleave="hoveredAssistantId = null">
              {{ assistant.meta?.title || assistant.name?.replaceAll(/[\-_]/g, " ") }}
            </AnimatedCardBackground>
          </template>
          <template #badge>
            <UBadge v-if="assistant.meta?.language" variant="outline" :icon="getLanguageIcon(assistant.meta.language)"
              :label="getLanguageTag(assistant)" />

            <div class="flex flex-col gap-3 justify-end w-full">
              <!-- Action Buttons -->
              <UButtonGroup class="justify-end w-full">
                <UButton color="primary" variant="ghost" icon="i-lucide-message-square"
                  @click="openEditSlideover(assistant)" />
                <UButton color="primary" variant="ghost" icon="i-lucide-edit"
                  @click="openEditSlideover(assistant, true)" />
                <UButton color="primary" variant="ghost" icon="i-lucide-phone" @click="openCallSlideover(assistant)" />
                <UButton color="primary" variant="ghost" icon="i-lucide-globe"
                  :href="`https://vai.keyreply.com/${assistant.name}`" target="_blank" rel="noopener noreferrer"
                  title="Open Web Link" />
                <UPopover arrow :content="{
                  side: 'top',
                }">
                  <UButton color="primary" variant="ghost" icon="i-lucide-more-horizontal" />
                  <template #content>
                    <div class="flex flex-col gap-1 p-2">

                      <UButton color="primary" variant="ghost" icon="i-lucide-copy" :label="t('assistant.copy-id')"
                        @click="() => copyAssistantId(assistant.id)" />

                      <UButton color="primary" variant="ghost" icon="i-lucide-copy-plus"
                        :label="t('assistant.duplicate')" @click="duplicateAssistant(assistant)" />

                      <UButton block color="error" variant="ghost" icon="i-lucide-trash-2"
                        :label="t('assistant.delete')" @click="deleteAssistant(assistant.id)" />

                    </div>
                  </template>
                </UPopover>
              </UButtonGroup>
            </div>
          </template>
        </UBlogPost>
      </UBlogPosts>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent, ref, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { formatTimeAgo } from '@vueuse/core'
import { useAssistants } from '@/composables/useAssistants'
import { useI18n } from 'vue-i18n'
import { upperFirst } from 'scule'

import AssistantSlideover from './AssistantSlideover.vue'
import PromptSlideover from './PromptSlideover.vue'
import CallSlideover from './CallSlideover.vue'
import AnimatedCardBackground from './AnimatedCardBackground.vue'
import type { Assistant } from '~/types/assistant'
import { languages, getLanguageIcon } from '~/i18n/languages'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UIcon = resolveComponent('UIcon')
const UTooltip = resolveComponent('UTooltip')
const UInput = resolveComponent('UInput')
const UButtonGroup = resolveComponent('UButtonGroup')
const UBlogPosts = resolveComponent('UBlogPosts')
const UBlogPost = resolveComponent('UBlogPost')
const UBadge = resolveComponent('UBadge')
const UPopover = resolveComponent('UPopover')

const toast = useToast()
const { t } = useI18n()
const slideover = useSlideover()

// interface Assistant {
//   id: string
//   name: string
//   firstMessage: string
//   prompt: string
//   model: {
//     model: string
//     provider: string
//   }
//   voice: {
//     provider: string
//     voiceId: string
//   }
//   createdAt: string
//   instructions: string
// }

const props = defineProps<{
  data: Assistant[]
}>()

const { isLoading } = useAssistants()

const table = useTemplateRef('table')

const columnVisibility = ref({
  id: false,
  voice: false,
  model: false
})

const columnFilters = ref([
  {
    id: 'name',
    value: ''
  }
])

const viewMode = ref('cards')

const searchFilter = ref('')

const hoveredAssistantId = ref<string | null>(null)

watch(searchFilter, (newValue) => {
  if (table.value?.tableApi) {
    table.value.tableApi.getColumn('name')?.setFilterValue(newValue)
  }
})

watch(() => table.value?.tableApi?.getColumn('name')?.getFilterValue(), (newValue) => {
  if (newValue !== undefined && newValue !== searchFilter.value) {
    searchFilter.value = newValue as string
  }
}, { immediate: true })

const filteredData = computed(() => {
  if (!searchFilter.value) return props.data

  return props.data.filter(assistant =>
    assistant?.name?.toLowerCase().includes(searchFilter.value.toLowerCase())
  )
})

const columns: TableColumn<Assistant>[] = [
  {
    accessorKey: 'id',
    header: () => t('table.id'),
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'font-mono text-xs text-gray-500' }, row.getValue('id')),
        h(UTooltip, { text: t('assistant.copy-id') }, () => h(UButton, {
          icon: 'i-lucide-copy',
          color: 'gray',
          variant: 'ghost',
          size: 'xs',
          onClick: () => copyAssistantId(row.getValue('id'))
        }))
      ])
    }
  },
  {
    accessorKey: 'name',
    header: () => t('assistant.name'),
    enableColumnFilter: true,
    filterFn: 'includesString',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('span', row.original.name),
      h(UButton, {
        icon: 'i-lucide-phone',
        color: 'primary',
        variant: 'ghost',
        size: 'xs',
        onClick: () => {
          openCallSlideover(row.original)
        }
      }),
      h(UButton, {
        color: 'primary',
        variant: 'ghost',
        size: 'xs',
        href: `https://vai.keyreply.com/${row.original.name}`,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'text-primary hover:text-primary-600',
        title: 'Open Web Link'
      }, [
        h(resolveComponent('UIcon'), {
          name: 'i-lucide-globe',
          size: 'sm'
        })
      ])
    ])
  },
  {
    accessorKey: 'model',
    header: () => t('model'),
    cell: ({ row }) => {
      const model = row.getValue('model') as Assistant['model']
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, {
          name: model?.provider === 'openai' ? 'i-lucide-bot' : 'i-lucide-cpu',
          class: 'w-4 h-4'
        }),
        h('span', {}, model?.model)
      ])
    }
  },

  {
    accessorKey: 'voice',
    header: () => t('voice'),
    cell: ({ row }) => {
      const voice = row.getValue('voice') as Assistant['voice']
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, {
          name: voice?.provider === '11labs' ? 'i-lucide-mic-2' : 'i-lucide-mic',
          class: 'w-4 h-4'
        }),
        h('span', {}, voice?.provider + ' / ' + voice?.voiceId)
      ])
    }
  },
  {
    accessorKey: 'createdAt',
    header: () => t('created-at'),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, { name: 'i-lucide-clock', class: 'w-4 h-4' }),
        h('span', {}, formatTimeAgo(date))
      ])
    }
  },
  {
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }) => {
      const items = getRowItems(row)
      return h('div', [
        h(UDropdownMenu, {
          items,
          mode: 'click',
          placement: 'bottom-end'
        }, {
          default: () => h(UButton, {
            icon: 'i-lucide-more-horizontal',
            color: 'gray',
            variant: 'ghost',
            size: 'xs',
            square: true
          })
        })
      ])
    }
  }
]

function getRowItems(row: Row<Assistant>) {
  return [
    {
      type: 'label',
      label: t('table.actions')
    },
    {
      label: t('assistant.copy-id'),
      icon: 'i-lucide-copy',
      onSelect() {
        copyAssistantId(row.original.id)
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('assistant.edit'),
      icon: 'i-lucide-pencil',
      onSelect() {
        openEditSlideover(row.original)
      }
    },
    {
      label: t('assistant.edit') + ' Advanced',
      icon: 'i-lucide-pencil',
      onSelect() {
        openEditSlideover(row.original, true)
      }
    },
    {
      label: t('assistant.duplicate'),
      icon: 'i-lucide-copy-plus',
      onSelect() {
        duplicateAssistant(row.original)
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('assistant.delete'),
      icon: 'i-lucide-trash-2',
      color: 'red',
      onSelect() {
        deleteAssistant(row.original.id)
      }
    }
  ]
}

function openEditSlideover(assistant: Assistant, advanced: boolean = false) {
  if (advanced) {
    slideover.open(AssistantSlideover, {
      title: t('assistant.edit'),
      assistant
    })
  } else {
    slideover.open(PromptSlideover, {
      title: t('assistant.edit'),
      assistant
    })
  }
}

function getLanguageTag(assistant: Assistant) {
  const language = languages.find(lang => lang.code === assistant.meta?.language)
  let label = language ? language.name : assistant.meta?.language

  if (assistant.meta?.accent) {
    label += ` (${assistant.meta.accent})`
  }

  return label
}

function openCallSlideover(assistant: Assistant) {
  slideover.open(CallSlideover, {
    assistant
  })
}

const deleteAssistant = async (id: string) => {
  try {
    await useFetch(`/api/assistants/${id}`, { method: 'DELETE' })
    toast.add({
      title: t('success'),
      description: t('assistant.assistant-deleted'),
      color: 'success'
    })
  } catch (error: any) {
    console.error('Failed to delete assistant:', error)
    toast.add({
      title: t('error'),
      description: error.message || t('assistant.failed-to-delete'),
      color: 'error'
    })
  }
}

const duplicateAssistant = async (assistant: any) => {
  try {
    const { data } = await useFetch('/api/assistants', {
      method: 'POST',
      body: {
        ...assistant,
        name: `${assistant.name} (${t('assistant.duplicate')})`,
        id: undefined
      }
    })

    toast.add({
      title: t('success'),
      description: t('assistant.assistant-duplicated'),
      color: 'success'
    })

    return data
  } catch (error: any) {
    console.error('Failed to duplicate assistant:', error)
    toast.add({
      title: t('error'),
      description: error.message || t('assistant.failed-to-duplicate'),
      color: 'error'
    })
  }
}

const copyAssistantId = (id: string) => {
  navigator.clipboard.writeText(id)
  toast.add({
    title: t('success'),
    description: t('assistant.id-copied'),
    color: 'success',
    icon: 'i-lucide-check'
  })
}
</script>

<style scoped>
.card-hover-effect {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.card-hover-effect:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-2xl);
}
</style>
