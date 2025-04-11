<template>
  <div>
    <div v-if="!props.compact"
      class="flex items-center justify-between px-4 py-3.5 gap-4 border-b flex-wrap border-[var(--ui-border-accented)]">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <UInput :model-value="table?.tableApi?.getColumn('assistant')?.getFilterValue() as string" class="w-64"
            placeholder="Filter by assistant..." icon="i-lucide-search"
            @update:model-value="table?.tableApi?.getColumn('assistant')?.setFilterValue($event)" />
        </div>
        <div class="relative h-auto w-full md:w-auto">
          <UDropdownMenu :resetSearchTermOnBlur="true" class="w-full" :items="botPhoneNumbers" :content="{
                align: 'start',
                side: 'bottom',
                sideOffset: 8
              }" :ui="{ content: 'max-h-96 overflow-y-auto' }">
              <UButton label="Filter by bot phone number" color="neutral" variant="outline"
                trailing-icon="i-lucide-chevron-down" class="w-full md:w-auto" />
            </UDropdownMenu>
          </div>
        <div class="flex gap-4 w-full md:w-auto">
          <!-- Dropdown: Tags Filter -->
          <div class="relative w-full md:w-auto">
            <UPopover v-model:open="shouldShowTagsFilter">
              <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down"
                class="w-full md:w-auto whitespace-nowrap">
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
      <div class="flex flex-col md:flex-row items-center gap-2">
        <div class="text-sm text-gray-500 mr-2 text-center md:text-left whitespace-nowrap w-fit">
          {{ data?.length || 0 }} data loaded
        </div>
        <div class="flex flex-col md:flex-row items-center gap-2">
          <div v-if="hasMore && !props.quickView">
            <UTooltip 
              text="Current is limited to 30000 calls, if you need more data click the button below">
              <UButton color="primary" variant="soft" :loading="isLoading" :disabled="isLoading || !hasMore"
                class="cursor-pointer w-full md:w-auto" @click="$emit('load-more')">
                <div class="flex items-center justify-center gap-2">
                  Load More
              </div>
              <UIcon name="i-lucide-info" class="size-10" />
            </UButton>
          </UTooltip>
        </div>
          <div class="flex items-center gap-2" v-if="!props.quickView">
            <UTooltip text="Only loaded records will be exported. Click 'Load More' to load all records first.">
              <UButton v-if="props.exportButton" color="primary" variant="soft" :loading="props.isExporting"
                :disabled="props.isLoadingTable || props.isExporting || !props.data?.length"
                class="group cursor-pointer max-w-full md:max-w-[200px] whitespace-nowrap" @click="$emit('export')">
                <div class="flex items-center justify-center gap-2">
                  <UIcon name="i-lucide-download" />
                  {{ props.isExporting
                  ? `Exporting...`
                  : t('export')
                  }}
                </div>
              </UButton>
            </UTooltip>
            <UDropdownMenu :items="table?.tableApi
                ?.getAllColumns()
                .filter((column) => [
                  'phoneNumber',
                  'botPhoneNumber',
                  'assistant',
                  'status',
                  'duration',
                  'tags',
                  'startedAt',
                  'scheduledAt',
                  'recordingUrl',
                  'endedReason'
                ].includes(column.id))
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
                }))" :content="{ align: 'end', class: 'max-h-[300px] overflow-y-auto' }">
              <UButton label="Columns" color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" />
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="flex items-center justify-center mt-4 gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-sm text-gray-600">Fetching calls... {{ fetchingProgress }}%</div>
        <UProgress :model-value="fetchingProgress" :max="100" class="w-64" />
      </div>
    </div>
    <UTable v-else ref="table" v-model:column-visibility="columnVisibility" v-model:column-filters="columnFilters"
      :data="pagedData" :columns="props.quickView ? quickViewColumns : columns"
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
    <CallSlideover :assistant="selectedAssistant"
      @success="(message) => toast.add({ title: 'Success', description: message, color: 'success', icon: 'i-lucide-check-circle' })"
      @error="(message) => toast.add({ title: 'Error', description: message, color: 'error', icon: 'i-lucide-alert-circle' })" />

    <!-- <EditTagModal v-if="isOpenEditReviewModal" :isOpen="isOpenEditReviewModal"
      @update:isOpen="(value) => isOpenEditReviewModal = value" @updateTags="handleUpdateTags" :categories="categories"
      :uniqueTags="uniqueTags" :selectedCall="selectedCall" /> -->

      <EditReviewModal v-if="isOpenEditReviewModal" 
        :isOpen="isOpenEditReviewModal"
        :isLoading="isLoadingEditReviewModal"
        :selectedCall="selectedCall" 
        @update:isOpen="(value) => isOpenEditReviewModal = value" 
        @updateReview="handleUpdateReview" 
      />

    <!-- Pagination -->
    <div v-if="!props.compact && totalCalls > pageSize && !isLoading"
      class="flex items-center justify-center mt-4 gap-4">
      <UPagination v-model:page="page" :total="filteredData.length" :items-per-page="pageSize" :show-edges="true" />
    </div>
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
import type { Assistant } from '~/types/assistant'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const UIcon = resolveComponent('UIcon')
const toast = useToast();
const slideover = useSlideover()
const selectedAssistant = ref<Assistant | undefined>()

const page = ref(1)
const pageSize = ref(100)

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
  isExporting: {
    type: Boolean,
    default: false
  },
  exportProgress: {
    type: Number,
    default: 0
  },
  exportButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['export', 'load-more', 'load-previous', 'load-first'])

const { isLoading, currentPlayingId, togglePlayAudio, selectedCall, hasMore, fetchingProgress, totalCalls, updateCall } = useCalls()

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

const isOpenEditReviewModal = ref(false)
const isLoadingEditReviewModal = ref(false)
const columnFilters = ref([
  {
    id: 'assistant',
    value: ''
  }
])

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

const selectedBotPhoneNumbers = ref([])

const botPhoneNumbers = computed(() => {
  return [...new Set(props.data?.map(call => call.botPhoneNumber) || [])].sort().map((phoneNumber) => ({
    label: phoneNumber,
    value: phoneNumber,
    type: 'checkbox' as const,
    checked: selectedBotPhoneNumbers.value.includes(phoneNumber),
    onUpdateChecked(checked: boolean) {
      // if number already in array, remove it, otherwise add it
      if(selectedBotPhoneNumbers.value.includes(phoneNumber)) {
        selectedBotPhoneNumbers.value = selectedBotPhoneNumbers.value.filter(number => number !== phoneNumber)
      } else {
        selectedBotPhoneNumbers.value.push(phoneNumber)
      }
    },
    onSelect(e?: Event) {
      e?.preventDefault()
    }
  }))
})



const columns = computed(() => {
  const baseColumns = [
    {
      accessorKey: "assistant",
      header: () => t('table.assistant'),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId) || ''
        return value.toLowerCase().includes(filterValue.toLowerCase())
      },
      cell: (row) => row.getValue("assistant")
    },
    {
      accessorKey: "customer",
      header: () => 'Phone Number',
      cell: (row) => row.getValue("customer")?.number
    },
    {
      accessorKey: "botPhoneNumber",
      header: () => 'Bot Phone Number',
      cell: (row) => row.getValue("botPhoneNumber")
    },
    {
      accessorKey: "assistantOverrides",
      header: () => 'Name',
      cell: (row) => {
        const overrides = row.getValue("assistantOverrides")
        return overrides?.variableValues?.name
      }
    },
    {
      accessorKey: 'startedAt',
      header: () => t('table.callReceived'),
      sortable: true,
      cell: (row) => {
        if (!row.getValue('startedAt')) return '';
        
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
    accessorKey: "endedReason",
    header: () => "Ended Reason",
    cell: (row) => {
      const reason = row.getValue('endedReason')
      if (!reason) return ''
      
      // Format the reason string
      const formatted = reason
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return h(UBadge, { 
        class: 'capitalize', 
        variant: 'subtle',
        color: 'warning'
      }, () => formatted)
    }
  })
  // add Review column
  baseColumns.push({
    accessorKey: "review",
    header: () => "Review",
    cell: ({row}) => {
      if(!row.original.review) {
        return h(UButton, { 
          icon: 'i-lucide-edit',
          color: 'primary',
          variant: 'ghost', 
          size: 'md',
          class: 'cursor-pointer shrink-0',  
          onClick: () => {
            isOpenEditReviewModal.value = true
            const id = row.original.id;
            const call = props.data.find(call => call.id === id)
            selectedCall.value = call
          }
        })
      }
      return h(UBadge, { class: 'capitalize cursor-pointer', variant: 'subtle' , onClick: () => { 
        isOpenEditReviewModal.value = true
        const id = row.original.id;
        const call = props.data.find(call => call.id === id)
        selectedCall.value = call
      } }, () =>
      [row.original.review, h(UIcon , { 
        name: 'i-lucide-edit',
      })]
      )
    }
  })

  baseColumns.push({
    accessorKey: "tags",
    header: () => "Tags",
    cell: ({row}) => {
      const tags = row.original.tags;
      return h(
        'div', 
        { class: 'flex flex-wrap gap-2' }, 
        tags.map((tag: string) => h(
          UBadge, 
          { class: 'capitalize cursor-pointer', variant: 'subtle', key: tag, color: 'info'}, 
          () => [
            tag
          ]
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
            if (currentPlayingId.value) {
              togglePlayAudio('', currentPlayingId.value)
            }
            const id = row.getValue('id');
            const call = props.data.find(call => call.id === id)
            selectedCall.value = call
            slideover.open(TranscriptSlideover)
          }
        })
      ])
    }
  })

  return baseColumns
})

const quickViewColumns = computed(() => {
  const baseColumns = [  
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => {
    return h('div', { class: 'text-sm text-gray-500' }, row.original.name || "N/A")
  } },
  { accessorKey: 'phoneNumber', header: 'Phone Number' },
  { accessorKey: 'botPhoneNumber', header: 'Bot Phone Number' },
  {
      accessorKey: "assistant",
      header: () => t('table.assistant'),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId) || ''
        return value.toLowerCase().includes(filterValue.toLowerCase())
      },
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
      accessorKey: "endedReason",
      header: () => "Ended Reason",
      cell: (row) => {
        const reason = row.getValue('endedReason')
        if (!reason) return ''
        
        // Format the reason string
        const formatted = reason
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        return h(UBadge, { 
          class: 'capitalize', 
          variant: 'subtle',
          color: 'warning'
        }, () => formatted)
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
                if (currentPlayingId.value) {
                togglePlayAudio('', currentPlayingId.value)
              }
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
  page.value = 1
  let rawData = props.data;

  if(selectedBotPhoneNumbers.value.length > 0) {
    rawData = rawData.filter(call => selectedBotPhoneNumbers.value.includes(call.botPhoneNumber));
  }

  if(selectedCategory.value && selectedValue.value) {
    rawData = rawData.filter(call => call.tags.includes(`${selectedCategory.value}: ${selectedValue.value}`));
  }

  return rawData;
})

const pagedData = computed(() => {
  return filteredData.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value);
})

const handleUpdateReview = async (review: string) => {
 try {
  isLoadingEditReviewModal.value = true
  selectedCall.value.review = review
  await updateCall(selectedCall.value.id, review)
  isLoadingEditReviewModal.value = false
  isOpenEditReviewModal.value = false
  toast.add({
    title: 'Review updated',
    description: 'Review updated successfully',
    color: 'success'
  })
 } catch (error) {
  isLoadingEditReviewModal.value = false
  toast.add({
    title: 'Review update failed',
    description: 'Review update failed',
    color: 'error'
  })
 }
}


</script>