<template>
  <UCard>
    <!-- header -->
    <template #header>
      <div class="flex justify-between gap-4">
        <div class="flex gap-4 items-center">
          <UButton color="primary" size="md" icon="i-lucide-user-plus" class="cursor-pointer">{{
            t('access-control.add-user') }}</UButton>
          <UButton color="neutral" size="md" icon="i-lucide-edit" class="cursor-pointer">{{ t('access-control.edit') }}
          </UButton>
          <UButton color="neutral" size="md" icon="i-lucide-trash" class="cursor-pointer">{{ t('access-control.delete')
            }}</UButton>
        </div>
        <div class="flex gap-4 items-center">
          <UInput v-model="search" :placeholder="t('access-control.search')" class="w-40" icon="i-lucide-search" />
          <UButton color="neutral" variant="outline" icon="i-lucide-filter" class="cursor-pointer">{{
            t('access-control.filter') }}</UButton>
        </div>
      </div>
    </template>
    <!-- table -->
    <UTable :columns="columns" :data="data" />
  </UCard>
</template>

<script lang="ts" setup>
const { t } = useI18n()
const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const search = ref('')
const rowSelection = ref({ 1: true })

const columns = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        ariaLabel: 'Select row'
      })
  },
  {
    accessorKey: 'name',
    header: () => t('access-control.table-name'),
  },
  {
    accessorKey: 'email',
    header: () => t('access-control.table-email'),
  },
  {
    accessorKey: 'role',
    header: () => t('access-control.table-role'),
    cell: (row) => {
      const color = {
        Admin: 'error' as const,
        User: 'success' as const,
      }[row.getValue('role') as string]
      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('role')
      )
    }
  },
  {
    accessorKey: 'assistant',
    header: () => t('access-control.table-assistant'),
    cell: ({ row }: { row: any }) => {
      const role = row.original.role;
      if (role === 'Admin') {
        return h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, 'All Assistants')
      }
      return row.getValue('assistant').map((assistant: string) => h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, assistant))
    }
  },
]
const data = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    assistant: ['Assistant 1', 'Assistant 2'],
  },
  {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'User',
    assistant: ['Assistant 1', 'Assistant 2'],
  },
]
</script>

<style></style>