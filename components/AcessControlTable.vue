<template>
  <UCard>
    <!-- header -->
    <template #header>
      <div class="flex justify-between gap-4">
        <div class="flex gap-4 items-center">
          <!-- <UButton color="primary" size="md" icon="i-lucide-user-plus" class="cursor-pointer" @click="isOpenAddUserModal = true">{{ t('access-control.add-user') }}</UButton> -->
          <!-- <UButton color="neutral" size="md" icon="i-lucide-edit" class="cursor-pointer" :disabled="!hasSelection">{{ t('access-control.edit') }}</UButton>
          <UButton color="neutral" size="md" icon="i-lucide-trash" class="cursor-pointer" :disabled="!hasSelection">{{ t('access-control.delete') }}</UButton> -->
        </div>
        <div class="flex gap-4 items-center">
          <UInput v-model="search" :placeholder="t('access-control.search')" class="w-40" icon="i-lucide-search" @input="handleSearch"/>
          <!-- <UPopover>
            <UButton color="neutral" variant="outline" icon="i-lucide-filter" class="cursor-pointer">{{ t('access-control.filter') }}</UButton>
            <template #content>
              <div class="p-4 min-w-[200px]">
                <UFormGroup :label="t('access-control.table-name')">
                  <UInput v-model="nameFilter" @input="handleNameFilter" :placeholder="t('access-control.filter-by-name')" />
                </UFormGroup>
              </div>
            </template>
          </UPopover> -->
        </div>
      </div>
    </template>
    <!-- table -->
    <template v-if="users.length > 0">
      <UTable 
        ref="tableRef"
        :columns="columns" 
        :data="users || []" 
        :loading="loading"
      />
      <div class="flex justify-between items-center mt-4 px-4">
        <div class="text-sm text-gray-500">
          {{ t('access-control.total-users', { count: total }) }}
        </div>
        <UPagination
          v-model="page"
          :total="total"
          :per-page="itemsPerPage"
          :show-arrows="true"
          class="mt-4"
          @click="(e: PointerEvent) => handlePageClick(e.target as HTMLElement)"
        />
      </div>
    </template>

    <UserAssistantEditModal 
      v-if="isOpenEditAssistantModal" 
      :isOpen="isOpenEditAssistantModal"
      @update:isOpen="isOpenEditAssistantModal = $event"
      :assistants="assistants" 
      :selectedUser="selectedUser" 
    />
    <AddUserModal 
      v-if="isOpenAddUserModal" 
      :isOpen="isOpenAddUserModal"
      @update:isOpen="isOpenAddUserModal = $event"
    />
  </UCard>
</template>

<script lang="ts" setup>
import type { User } from '@auth/core/types'
import { useDebounceFn } from '@vueuse/core'
import UserAssistantEditModal from './UserAssistantEditModal.vue'
import { useUserManagement } from '@/composables/useUserManagement'

const { t } = useI18n()
const { assistants, fetchAssistants } = useAssistants()
const { 
  users, 
  total, 
  currentPage, 
  itemsPerPage, 
  loading,
  error,
  fetchUsers 
} = useUserManagement()

// Use computed for page to sync with currentPage
const page = computed({
  get: () => currentPage.value,
  set: (value) => currentPage.value = value
})

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const search = ref('')
const isOpenEditAssistantModal = ref(false)
const isOpenAddUserModal = ref(false)
const selectedUser = ref<User>({} as User)

// Template refs for table
const tableRef = ref()

// Handle search with debounce
const handleSearch = useDebounceFn(() => {
  // Only search if there are 3 or more characters, or if the search is empty
  if (search.value.length === 0 || search.value.length >= 3) {
    fetchUsers({ search: search.value, page: 1 })
  }
}, 300)

const columns = [
  {
    id: 'number',
    header: () => '#',
    cell: ({ row }: { row: any }) => {
      return ((currentPage.value - 1) * itemsPerPage.value) + row.index + 1
    }
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
    cell: (row: any) => {
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
    accessorKey: 'assistants',
    header: () => t('access-control.table-assistant'),
    cell: ({ row }: { row: any }) => {
      const role = row.original.role;
      if (role === 'Admin') {
        return h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, 'All Assistants')
      }
      
      return h('div', { class: 'flex items-center' }, [
        ...row.getValue('assistants').map((assistant: string) => h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, assistant)),
        h(UButton, { 
          icon: 'i-lucide-edit',
          color: 'primary',
          variant: 'ghost', 
          size: 'md',
          class: 'cursor-pointer',
          onClick: () => {
            selectedUser.value = row.original
            isOpenEditAssistantModal.value = true
          }
        })
      ])
    }
  },
]

// Handle page click
const handlePageClick = async (element: HTMLElement) => {
  const newPage = parseInt(element.textContent || '1')
  if (!isNaN(newPage)) {
    console.log('Page clicked:', newPage)
    await fetchUsers({ page: newPage, search: search.value })
  }
}

onMounted(async () => {
  await Promise.all([
    fetchAssistants(),
    fetchUsers()
  ])
})
</script>
