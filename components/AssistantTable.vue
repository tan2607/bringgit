<template>
  <div>
    <div class="flex justify-end px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
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
    <UTable ref="table" v-model:column-visibility="columnVisibility" :data="data" :columns="columns"
      :loading="isLoading" class="flex-1" :ui="{
        tr: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
      }" @row-select="openEditSlideover">
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

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UIcon = resolveComponent('UIcon')
const UTooltip = resolveComponent('UTooltip')
const UPopover = resolveComponent('UPopover')
const UInput = resolveComponent('UInput')
const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')

const toast = useToast()
const { t } = useI18n()
const slideover = useSlideover()

interface Assistant {
  id: string
  name: string
  firstMessage: string
  prompt: string
  model: {
    model: string
    provider: string
  }
  voice: {
    provider: string
    voiceId: string
  }
  createdAt: string
  instructions: string
}

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

const phoneNumber = ref('+65')
const isCallLoading = ref(false)

const makeCall = async (assistant: Assistant) => {
  try {
    isCallLoading.value = true
    const { data: response } = await useFetch('/api/call', {
      method: 'POST',
      body: {
        assistantId: assistant.id,
        phoneNumber: phoneNumber.value
      }
    })

    if (response.value?.error) {
      throw new Error(response.value.error)
    }

    toast.add({
      title: 'Call initiated',
      description: `Call to ${phoneNumber.value} has been initiated using assistant "${assistant.name}"`,
      icon: 'i-lucide-phone'
    })
    phoneNumber.value = ''
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  } finally {
    isCallLoading.value = false
  }
}

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
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, { name: 'i-lucide-bot', class: 'w-4 h-4' }),
        h('span', {}, row.getValue('name'))
      ])
    }
  },
  {
    accessorKey: 'model',
    header: () => t('model'),
    cell: ({ row }) => {
      const model = row.getValue('model')
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, {
          name: model.provider === 'openai' ? 'i-lucide-bot' : 'i-lucide-cpu',
          class: 'w-4 h-4'
        }),
        h('span', {}, model.model)
      ])
    }
  },

  {
    accessorKey: 'voice',
    header: () => t('voice'),
    cell: ({ row }) => {
      const voice = row.getValue('voice')
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, {
          name: voice.provider === 'elevenlabs' ? 'i-lucide-mic-2' : 'i-lucide-mic',
          class: 'w-4 h-4'
        }),
        h('span', {}, voice.provider + ' / ' + voice.voiceId)
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
    id: 'call',
    header: () => t('call'),
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UPopover, {}, {
          default: () => h(UButton, {
            icon: 'i-lucide-phone',
            color: 'primary',
            variant: 'ghost',
            size: 'sm',
            label: t('call')
          }),
          content: () => h('div', { class: 'p-4 w-72' }, [
            h(UForm, {
              state: phoneNumber,
              onSubmit: () => makeCall(row.original)
            }, {
              default: () => [
                h(UFormField, {
                  name: 'phoneNumber',
                  label: t('phone-number')
                }, () => h(UInput, {
                  modelValue: phoneNumber.value,
                  'onUpdate:modelValue': (value) => phoneNumber.value = value,
                  placeholder: '+1234567890',
                  icon: 'i-lucide-phone'
                })),
                h('div', { class: 'mt-4 flex justify-end' }, [
                  h(UButton, {
                    type: 'submit',
                    color: 'primary',
                    label: t('call'),
                    loading: isCallLoading.value,
                    icon: 'i-lucide-phone'
                  })
                ])
              ]
            })
          ])
        })
      ])
    }
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Actions'),
    cell: ({ row }) => {
      const items = getRowItems(row)
      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(UDropdownMenu, {
          items,
          'content-class': 'w-48'
        }, {
          default: () => h(UButton, {
            icon: 'i-lucide-ellipsis-horizontal',
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
      label: t('call-assistant'),
      icon: 'i-lucide-phone',
      onSelect() {
        slideover.open(AssistantSlideover, {
          assistant: row.original
        })
      }
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
    props: {
      assistant: row.original
    }
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
