<template>
  <div>
    <div class="flex items-center justify-between px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
      <div class="flex items-center gap-4">
        <UInput :model-value="table?.tableApi?.getColumn('assistant')?.getFilterValue() as string" class="w-64"
          placeholder="Filter by assistant..." icon="i-lucide-search"
          @update:model-value="table?.tableApi?.getColumn('assistant')?.setFilterValue($event)" />
        <div class="flex flex-col gap-4 w-64">
          <!-- Dropdown: Tags Filter -->
          <div class="relative">
            <UPopover v-model:open="shouldShowTagsFilter">
              <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down">
                Tags Filter
              </UButton>
              <template #content>
                <div class="p-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg w-60">
                  <div class="text-white font-semibold mb-2">Select a Category</div>
                  <ul class="space-y-2">
                    <li v-for="category in categories" :key="category">
                      <UButton :color="selectedCategory === category ? 'success' : 'neutral'" variant="outline"
                        class="w-full text-left cursor-pointer" @click="handleChooseCategory(category)">
                        {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                      </UButton>
                    </li>
                  </ul>

                  <!-- Second Dropdown: Select Value -->
                  <div v-if="selectedCategory"
                    class="mt-4 p-3 bg-neutral-800 border border-neutral-600 rounded-lg shadow-md">
                    <div class="text-white font-semibold mb-2">Select a Value</div>
                    <ul class="space-y-2">
                      <li v-for="value in filteredOptions" :key="value">
                        <UButton :color="selectedValue === value ? 'success' : 'neutral'" variant="outline"
                          class="w-full text-left cursor-pointer" @click="handleChooseValue(value)">
                          {{ value }}
                        </UButton>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="props.exportButton"
          color="primary"
          variant="soft"
          :disabled="props.isLoadingTable || isLoading || !props.data?.length"
          class="group cursor-pointer"
          @click="$emit('export')"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-download"
            />
            {{ t('export') }}
          </div>
        </UButton>
        <UDropdownMenu
          :items="table?.tableApi
            ?.getAllColumns()
            .filter((column) => ['duration', 'status', 'tags'].includes(column.id))
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
            }))"
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columns"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>
      </div>
    </div>
    <UTable ref="table" v-model:column-visibility="columnVisibility" v-model:column-filters="columnFilters"
      :data="filteredData" :columns="props.quickView ? quickViewColumns : columns"
      :loading="props.isLoadingTable || isLoading">
      <template #status-data="{ row }">
        <UBadge :color="row.status === 'ended' ? 'success' : 'info'">
          {{ row.status }}
        </UBadge>
      </template>
      <template #loading-state>
        <div class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>
      </template>
    </UTable>
    <CallSlideover
      @success="(message) => toast.add({ title: 'Success', description: message, color: 'success', icon: 'i-lucide-check-circle' })"
      @error="(message) => toast.add({ title: 'Error', description: message, color: 'error', icon: 'i-lucide-alert-circle' })" />
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo, useClipboard } from '@vueuse/core'
import { useCalls } from '@/composables/useCalls'
import TranscriptSlideover from '@/components/TranscriptSlideover.vue'
import CallSlideover from '@/components/CallSlideover.vue'
import { upperFirst } from 'scule'
import { useI18n } from 'vue-i18n'
import { useRecordingUrl } from '@/composables/useRecordingUrl'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const USelectMenu = resolveComponent('USelectMenu')
const UInput = resolveComponent('UInput')
const toast = useToast();
const slideover = useSlideover()

interface TableData {
  id: string
  assistant: string
  startedAt: string
  recordingUrl: string
  duration: string
  summary?: string
  status: string
}

const props = defineProps({
  data: {
    type: Array as PropType<TableData[]>,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  quickView: {
    type: Boolean,
    default: false
  },
  isLoadingTable: {
    type: Boolean,
    default: false
  },
  exportButton: {
    type: Boolean,
    default: false
  }
})

defineEmits(['export'])

const { isLoading, currentPlayingId, togglePlayAudio, selectedCall } = useCalls()

const { t } = useI18n()
const { transformRecordingUrl } = useRecordingUrl()

const { copy } = useClipboard()

const table = useTemplateRef('table')

const shouldShowTagsFilter = ref(false)

const columnVisibility = ref({
  duration: true,
  status: true,
  id: true
})

const columnFilters = ref([
  {
    id: 'assistant',
    value: ''
  }
])

const uniqueAssistants = computed(() => {
  const assistants = new Set(props.data?.map(call => call.assistant) || [])
  return Array.from(assistants).sort()
})

const uniqueTags = computed(() => {
  const tags = new Set(
    props.data
      ?.flatMap((call: any) => call.tags || []) 
      .map((tag: string) => tag.split(",")) 
      .flat()
      .map((tag: string) => tag.trim())
  );
  
  return Array.from(tags).sort();
});

const categories = computed(() => {
  return [...new Set(uniqueTags.value.map(tag => tag.split(":")[0]))].sort((a,b) => a.length - b.length);
});

const selectedCategory = ref(null);
const selectedValue = ref(null);

const filteredOptions = computed(() => {
  return uniqueTags.value
    .filter(tag => tag.startsWith(`${selectedCategory.value}:`))
    .map(tag => tag.split(": ")[1]); 
});



const columns = computed(() => {
  const baseColumns = [
    {
      accessorKey: "assistant",
      header: () => t('table.assistant'),
      enableColumnFilter: true,
      filterFn: 'includesString',
      cell: (row) => row.getValue("assistant")
    },
    {
      accessorKey: "customer",
      header: () => 'Phone Number',
      cell: (row) => row.getValue("customer")?.number
    },
    {
      accessorKey: "assistantOverrides.variableValues.name",
      header: () => 'Name',
      cell: (row) => row.getValue("assistantOverrides.variableValues.name")
    },
    {
      accessorKey: 'startedAt',
      header: () => t('table.callReceived'),
      sortable: true,
      cell: (row) => {
        const time = new Date(row.getValue('startedAt'));
        const timeAgo = formatTimeAgo(time)
        return time.toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }) + ` (${timeAgo})`
      }
    },
    {
      accessorKey: "recordingUrl",
      header: () => t('table.recording'),
      cell: (row) => {
        const isPlaying = computed(() => currentPlayingId.value === row.getValue('id'))
        const proxyUrl = transformRecordingUrl(row.getValue('recordingUrl'))
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            icon: isPlaying.value ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
            size: 'sm',
            color: isPlaying.value ? 'error' : 'primary',
            variant: isPlaying.value ? 'solid' : 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => togglePlayAudio(proxyUrl, row.getValue('id'))
          }),
          h(UButton, {
            icon: 'i-lucide-share-2',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              copy(proxyUrl)
              toast.add({
                title: 'URL Copied',
                duration: 1500,
                description: 'File URL copied to clipboard!',
                color: 'success', // or another appropriate color
                icon: 'i-lucide-check' // optional icon
              })
            }
          }),
          h(UButton, {
            icon: 'i-lucide-download',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              const link = document.createElement('a')
              link.href = proxyUrl
              link.download = `recording-${row.getValue('id')}.mp3`
              link.click()
            }
          })
        ])
      }
    },
    {
      accessorKey: "duration",
      header: () => t('table.duration'),
      cell: (row) => {
        const duration = row.getValue('duration')
        if(!duration) {
          return "N/A"
        }
        return duration
      }
    }
  ]

  // Only add these columns if not in compact mode
  if (!props.compact) {
    baseColumns.unshift({
      accessorKey: "id",
      header: () => t('table.id'),
      cell: (row) => row.getValue("id").slice(0, 6)
    })

    baseColumns.push({
      accessorKey: "status",
      header: () => t('table.status'),
      cell: (row) => {
        return h(UBadge, { class: 'capitalize', variant: 'subtle' }, () =>
          row.getValue('status')
        )
      }
    })

    baseColumns.push({
      accessorKey: "tags",
      header: () => "Tags",
      cell: (row) => {
        const tags = row.getValue('tags');
        return h(
          'div', 
          { class: 'flex flex-wrap gap-2' }, 
          tags.map((tag: string) => h(
            UBadge, 
            { class: 'capitalize', variant: 'subtle', key: tag, color: 'info' }, 
            () => tag
          ))
        );
      }
    })

    baseColumns.push({
      accessorKey: "id",
      header: () => t('table.actions'),
      cell: (row) => {
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            icon: 'i-lucide-file-text',
            label: 'View Transcript',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            onClick: () => {
              const id = row.getValue('id');
              const call = props.data.find(call => call.id === id)
              selectedCall.value = call
              slideover.open(TranscriptSlideover)
            }
          })
        ])
      }
    })
  }

  return baseColumns
})

const quickViewColumns = computed(() => {
  const baseColumns = [  
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => {
    return h('div', { class: 'text-sm text-gray-500' }, row.original.name || "N/A")
  } },
  { accessorKey: 'phoneNumber', header: 'Phone Number' },
  {
      accessorKey: "assistant",
      header: () => t('table.assistant'),
      enableColumnFilter: true,
      filterFn: 'includesString',
      cell: (row) => {
        const assistant = row.getValue('assistant')
        if(!assistant) {
          return "N/A"
        }
        return assistant
      }
  },
  { accessorKey: 'retryCount', header: 'Retry Count' },
  { accessorKey: 'scheduledAt', header: 'Job Scheduled At', cell: ({ row }) => {
    const time = new Date(row.getValue('scheduledAt'));
    const timeAgo = formatTimeAgo(time)
    return time.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
          }) + ` (${timeAgo})`
    }
  },
  {
      accessorKey: "status",
      header: () => t('table.status'),
      cell: (row) => {
        return h(UBadge, { class: 'capitalize', variant: 'subtle' }, () =>
          row.getValue('status')
        )
      }
  },
  {
      accessorKey: 'startedAt',
      header: () => t('table.callReceived'),
      sortable: true,
      cell: (row) => {
        const startedAt = row.getValue('startedAt')
        if(!startedAt) {
          return "N/A"
        }
        const time = new Date(startedAt);
        const timeAgo = formatTimeAgo(time)
        return time.toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }) + ` (${timeAgo})`
      }
    },
    {
      accessorKey: "recordingUrl",
      header: () => t('table.recording'),
      cell: (row) => {
        const recordingUrl = row.getValue('recordingUrl')
        if(!recordingUrl) {
          return "N/A"
        }
        const isPlaying = computed(() => currentPlayingId.value === row.getValue('id'))
        const proxyUrl = transformRecordingUrl(recordingUrl)
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            icon: isPlaying.value ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
            size: 'sm',
            color: isPlaying.value ? 'error' : 'primary',
            variant: isPlaying.value ? 'solid' : 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => togglePlayAudio(proxyUrl, row.getValue('id'))
          }),
          h(UButton, {
            icon: 'i-lucide-share-2',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              copy(proxyUrl)
              toast.add({
                title: 'URL Copied',
                duration: 1500,
                description: 'File URL copied to clipboard!',
                color: 'success', // or another appropriate color
                icon: 'i-lucide-check' // optional icon
              })
            }
          }),
          h(UButton, {
            icon: 'i-lucide-download',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              const link = document.createElement('a')
              link.href = proxyUrl
              link.download = `recording-${row.getValue('id')}.mp3`
              link.click()
            }
          })
        ])
      }
    },
    {
      accessorKey: "duration",
      header: () => t('table.duration'),
      cell: (row) => {
        const duration = row.getValue("duration")
        if(!duration) {
          return "N/A"
        }
        return duration
      }
    }
]

  if (!props.compact) {

      baseColumns.push({
        accessorKey: "tags",
        header: () => "Tags",
        cell: (row) => {
          const tags = row.getValue('tags');
          if(!tags) {
            return "N/A"
          }
          return h(
            'div', 
            { class: 'flex flex-wrap gap-2' }, 
            tags.map((tag: string) => h(
              UBadge, 
              { class: 'capitalize', variant: 'subtle', key: tag, color: 'info' }, 
              () => tag
            ))
          );
        }
      })

      baseColumns.push({
        accessorKey: "vapiId",
        header: () => t('table.actions'),
        cell: (row) => {
          const vapiId = row.getValue('vapiId')
          console.log(vapiId);
          if(!vapiId) {
            return "N/A"
          }
          return h('div', { class: 'flex gap-2' }, [
            h(UButton, {
              icon: 'i-lucide-file-text',
              label: 'View Transcript',
              size: 'sm',
              color: 'primary',
              variant: 'ghost',
              onClick: () => {
                const call = props.data.find(call => call.vapiId === vapiId)
                selectedCall.value = call
                slideover.open(TranscriptSlideover)
              }
            })
          ])
        }
      })
  }

  return baseColumns
})


const handleChooseCategory = (category: string) => {
  if(selectedCategory.value === category) {
    selectedCategory.value = null
    selectedValue.value = null
    return
  }
  selectedCategory.value = category
  selectedValue.value = null
}

const handleChooseValue = (value: string) => {
  if(selectedValue.value === value) {
    selectedValue.value = null
    return
  }
  selectedValue.value = value
}


const filteredData = computed(() => {
  if(!selectedCategory.value || !selectedValue.value) {
    return props.data
  } 

  if(selectedCategory.value && selectedValue.value) {
    return props.data.filter(call => call.tags.includes(`${selectedCategory.value}: ${selectedValue.value}`))
  }
})

</script>