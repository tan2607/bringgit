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
        :data="users" 
        :loading="loading"
      />
      <div class="flex justify-between items-center mt-4 px-4">
        <div class="text-sm text-gray-500">
          {{ t('access-control.total-users', { count: total }) }}
        </div>
        <UPagination
          :total="total"
          :per-page="itemsPerPage"
          :show-arrows="true"
          class="mt-4"
          :page="currentPage"
          @update:page="(val) => currentPage = val"
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
const { fetchUsers } = useUserManagement()

const currentPage = ref(2)
const itemsPerPage = ref(10)
const search = ref('')

const { 
  data: userData,
  pending: loading,
  error,
  refresh: refreshUsers
} = useAsyncData(
  'users',
  () => fetchUsers({ 
    page: currentPage.value,
    limit: itemsPerPage.value,
    search: search.value 
  }),
  {
    watch: [currentPage]
  }
)

const users = computed(() => userData.value?.users || [])
const total = computed(() => userData.value?.total || 0)

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const isOpenEditAssistantModal = ref(false)
const isOpenAddUserModal = ref(false)
const selectedUser = ref<User>({} as User)

// Template refs for table
const tableRef = ref()

// Handle search with debounce
const handleSearch = useDebounceFn(() => {
  // Only search if there are 3 or more characters, or if the search is empty
  if (search.value.length === 0 || search.value.length >= 3) {
    currentPage.value = 1 // Reset to first page on search
    refreshUsers()
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
        ...row.getValue('assistants')?.map((assistant: string) => h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, assistant)),
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

onMounted(async () => {
  await Promise.all([
    fetchAssistants()
  ])
})
</script>