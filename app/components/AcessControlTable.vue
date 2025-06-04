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
          <UButton 
            icon="i-lucide-refresh-cw" 
            variant="ghost" 
            :loading="loading"
            class="cursor-pointer"
            @click="refreshUsers"
          />
          <template v-if="isPermissionSuperAdmin">
            <UCheckbox 
              v-model="includeSuperadmin" 
              label="include superadmin users"
              @change="resetPageAndRefresh"
            />
          </template>
          <!-- <UPopover>
            <UButton color="neutral" variant="outline" icon="i-lucide-filter" class="cursor-pointer">{{ t('access-control.filter') }}</UButton>
            <template #content>
              <div class="p-4 min-w-[200px]">
                <UFormField :label="t('access-control.table-name')">
                  <UInput v-model="nameFilter" @input="handleNameFilter" :placeholder="t('access-control.filter-by-name')" />
                </UFormField>
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

    <UserBotPhoneNumberEditModal 
      v-if="isOpenEditBotPhoneNumberModal" 
      :isOpen="isOpenEditBotPhoneNumberModal"
      @update:isOpen="isOpenEditBotPhoneNumberModal = $event"
      :botPhoneNumbers="numbers"
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

const { t } = useI18n()
const { assistants, fetchAssistants, getAssistantById } = useAssistants()
const { fetchUsers, updateUserRole } = useUserManagement()
const { isPermissionSuperAdmin } = useUser()
const { numbers, fetchNumbers, getPhoneNumberById } = usePhoneNumbers()

const currentPage = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const includeSuperadmin = ref(true)

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
    search: search.value,
    includeSuperadmin: includeSuperadmin.value
  }),
  {
    watch: [currentPage, includeSuperadmin]
  }
)

const users = computed(() => userData.value?.users || [])
const total = computed(() => userData.value?.total || 0)

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UPopover = resolveComponent('UPopover')
const isOpenEditAssistantModal = ref(false)
const isOpenAddUserModal = ref(false)
const selectedUser = ref<User>({} as User)
const isOpenEditBotPhoneNumberModal = ref(false)

// Template refs for table
const tableRef = ref()

// Handle search with debounce
const handleSearch = useDebounceFn(() => {
  // Only search if there are 3 or more characters, or if the search is empty
  if (search.value.length === 0 || search.value.length >= 3) {
    resetPageAndRefresh()
  }
}, 300)

const resetPageAndRefresh = () => {
  currentPage.value = 1
  refreshUsers()
}

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
    cell: ({ row }: { row: any }) => {
      const role = row.getValue('role')
      const color = {
        Admin: 'error' as const,
        User: 'success' as const,
      }[role]
      
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => role),
        h(UPopover, {
          mode: 'click',
          class: 'min-w-[120px]'
        }, {
          default: () => h(UButton, {
            icon: 'i-lucide-edit',
            color: 'primary',
            variant: 'ghost',
            size: 'xs',
            class: 'cursor-pointer'
          }),
          content: () => h('div', { class: 'p-2' }, [
            h('select', {
              value: role,
              class: 'w-full px-2 py-1 border rounded',
              onChange: async (e: Event) => {
                const newRole = (e.target as HTMLSelectElement).value
                if (newRole === role) return
                try {
                  await updateUserRole(row.original.id, newRole === 'Admin')
                  await refreshUsers()
                } catch (error) {
                  console.error('Failed to update role:', error)
                }
              }
            }, [
              h('option', { value: 'Admin' }, 'Admin'),
              h('option', { value: 'User' }, 'User')
            ])
          ])
        })
      ])
    }
  },
  {
    accessorKey: 'assistants',
    header: () => t('access-control.table-assistant'),
    cell: ({ row }: { row: any }) => {
      const role = row.original.role;
      if (role === 'Admin') {
        return h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, `${t('access-control.table-all-assistants')}`)
      }
      
      return h('div', { 
        class: 'flex flex-wrap items-center gap-2'  
      }, [
        ...(row.getValue('assistants') || []).map((assistantId: string) => {
          const assistant = getAssistantById(assistantId)
          if (!assistant) return null
          return h(UBadge, { 
            variant: 'outline', 
            color: 'neutral', 
            class: 'capitalize', 
            size: 'md'
          }, () => assistant?.name || assistantId)
        }),
        h(UButton, { 
          icon: 'i-lucide-edit',
          color: 'primary',
          variant: 'ghost', 
          size: 'md',
          class: 'cursor-pointer shrink-0',  
          onClick: () => {
            selectedUser.value = row.original
            isOpenEditAssistantModal.value = true
          }
        })
      ])
    }
  },
  {
    accessorKey: 'botPhoneNumbers',
    header: () => t('access-control.table-bot-phone-numbers'),
    cell: ({ row }: { row: any }) => {
      const role = row.original.role;
      if (role === 'Admin') {
        return h(UBadge, { variant: 'outline', color: 'neutral', class: 'capitalize mr-2', size: 'md' }, `${t('access-control.table-all-phone-numbers')}`)
      }
      return h('div', { 
        class: 'flex flex-wrap items-center gap-2'  
      }, [
        
      ...(row.getValue('botPhoneNumbers') || []).map((botPhoneNumber: any) => {
        const phoneNumber = getPhoneNumberById(botPhoneNumber)
        if (!phoneNumber) return null
          return h(UBadge, { 
            variant: 'outline', 
            color: 'neutral', 
            class: 'capitalize', 
            size: 'md'
          }, () => `${phoneNumber?.name} (${phoneNumber?.number})`)
        }),
        h(UButton, { 
          icon: 'i-lucide-edit',
          color: 'primary',
          variant: 'ghost', 
          size: 'md',
          class: 'cursor-pointer shrink-0',  
          onClick: () => {
            selectedUser.value = row.original
            isOpenEditBotPhoneNumberModal.value = true
          }
        })
      ])
    }
  }
]

onMounted(async () => {
  await Promise.all([
    fetchAssistants(),
    fetchNumbers()
  ])
})
</script>