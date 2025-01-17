<template>
  <div>
    <div class="flex items-center justify-between px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
      <!-- Filter Section -->
      <UInput
        :model-value="table?.tableApi?.getColumn('name')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Filter by name..."
        icon="i-lucide-search"
        @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)"
      />
      
      <!-- Column Visibility Dropdown -->
      <UDropdownMenu :items="table?.tableApi
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
    <UTable 
      ref="table" 
      v-model:column-visibility="columnVisibility" 
      v-model:column-filters="columnFilters"
      :data="data" 
      :columns="columns"
      :loading="isLoading" 
      class="flex-1" 
      :ui="{
        tr: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
      }" 
      @row-select="openEditSlideover">
      <template #loading-state>
        <div class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { formatTimeAgo } from '@vueuse/core'
import { useAssistants } from '@/composables/useAssistants'
import { useI18n } from 'vue-i18n'
import { upperFirst } from 'scule'
import AssistantSlideover from './AssistantSlideover.vue'
import PromptSlideover from './PromptSlideover.vue'
import CallSlideover from './CallSlideover.vue'
import type { Vapi } from '@vapi-ai/server-sdk'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UIcon = resolveComponent('UIcon')
const UTooltip = resolveComponent('UTooltip')
const UInput = resolveComponent('UInput')

const toast = useToast()
const { t } = useI18n()
const slideover = useSlideover()

type Assistant = Vapi.Assistant
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
          onClick: () => {
            navigator.clipboard.writeText(row.getValue('id'))
            toast.add({
              title: t('success'),
              description: t('assistant.id-copied'),
              color: 'success',
              icon: 'i-lucide-check'
            })
          }
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
          slideover.open(CallSlideover, {
            assistant: row.original
          })
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
      const model = row.getValue('model') as Vapi.Assistant['model']
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
      const voice = row.getValue('voice') as Vapi.Assistant['voice']
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
        navigator.clipboard.writeText(row.original.id)
        toast.add({
          title: t('success'),
          description: t('assistant.id-copied'),
          color: 'success',
          icon: 'i-lucide-check'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('assistant.edit'),
      icon: 'i-lucide-pencil',
      onSelect() {
        slideover.open(PromptSlideover, {
          assistant: row.original
        })
      }
    },
    {
      label: t('assistant.edit') + ' Advanced',
      icon: 'i-lucide-pencil',
      onSelect() {
        slideover.open(AssistantSlideover, {
          assistant: row.original
        })
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

function openEditSlideover(row: Row<Assistant>) {
  slideover.open(AssistantSlideover, {
    title: t('assistant.edit'),
    assistant: row.original
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
</script>
