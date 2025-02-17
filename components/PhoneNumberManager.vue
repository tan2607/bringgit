<template>
  <div class="space-y-6">
    <!-- Current Phone Numbers List -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{t('phoneNumbers')}}</h3>
          <div class="flex gap-2">
            <UPopover v-model:open="isOpenRegisterNumberModal" :popper="{ placement: 'bottom-end' }" mode="click" :dismissible="false">
              <UButton
                color="primary"
                icon="i-lucide-plus"
                :label="t('newNumber')"
              />
              
              <template #content>
                <div class="p-4 w-[400px]">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">{{ t('registerNewPhoneNumber') }}</h3>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-x"
                      @click="isOpenRegisterNumberModal = false"
                      class="cursor-pointer"
                    />
                  </div>

                  <UForm 
                    :state="form"
                    :schema="schema"
                    @submit="handleSubmit" 
                    class="space-y-4"
                  >
                    <UFormField 
                      :label="t('phoneForm.name')" 
                      name="name"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.name"
                        :placeholder="t('phoneForm.nameDesc')"
                      />
                    </UFormField>

                    <UFormField 
                      :label="t('phoneForm.phoneNumber')" 
                      name="phoneNumber"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.phoneNumber"
                        :placeholder="t('phoneForm.phoneNumberDesc')"
                      />
                    </UFormField>

                    <UFormField 
                      :label="t('phoneForm.username')" 
                      name="username"
                    >
                      <UInput
                        class="w-full"
                        v-model="form.username"
                        :placeholder="t('phoneForm.usernameDesc')"
                      />
                    </UFormField>

                    <UFormField 
                      :label="t('phoneForm.passwordOptional')" 
                      name="password"
                    >
                      <UInput
                        class="w-full"
                        v-model="form.password"
                        type="password"
                        :placeholder="t('phoneForm.passwordDesc')"
                      />
                    </UFormField>

                    <UFormField 
                      :label="t('phoneForm.domain')" 
                      name="domain"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.domain"
                        :placeholder="t('phoneForm.domainDesc')"
                      />
                    </UFormField>

                    <UFormField
                      :label="t('phoneForm.port')" 
                      name="port"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.port"
                        type="number"
                        min="1"
                        max="65535"
                        :placeholder="t('phoneForm.portDesc')"
                        @input="validatePort"
                      />
                      <template #help>
                        <span class="text-xs text-gray-500">{{ t('phoneForm.portHelperText') }}</span>
                      </template>
                    </UFormField>

                    <UFormField
                      :label="t('phoneForm.protocol')" 
                      name="protocol"
                      required
                    >
                      <URadioGroup
                        v-model="form.protocol"
                        :items="[
                          { label: 'TCP', value: 'tcp' },
                          { label: 'UDP', value: 'udp' }
                        ]"
                        color="primary"
                        name="protocol"
                      />
                    </UFormField>

                    <div class="flex justify-end">
                      <UButton
                        type="submit"
                        color="primary"
                        :loading="isSubmitting"
                      >
                        {{ t('phoneForm.register') }}
                      </UButton>
                    </div>
                  </UForm>
                </div>
              </template>
            </UPopover>

            <UButton
              icon="i-lucide-refresh-cw"
              :loading="isLoading"
              variant="ghost"
              @click="fetchNumbers(true)"
            />
          </div>
        </div>
      </template>

      <div>
        <div class="flex items-center justify-between px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
          <!-- Filter Section -->
          <UInput
            v-model="searchQuery"
            class="max-w-sm"
            :placeholder="t('filterPlaceholder')"
            icon="i-lucide-search"
          />
        </div>

        <UTable
          :data="filteredNumbers"
          :columns="columns"
          :loading="isLoading"
        >
          <template #loading-state>
            <div class="flex items-center justify-center h-32">
              <UIcon name="i-lucide-loader-2" class="animate-spin" />
            </div>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { z } from 'zod'
const { t } = useI18n()

const { numbers, isLoading, fetchNumbers } = usePhoneNumbers()
const toast = useToast()
const isSubmitting = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')
const UButton = resolveComponent('UButton');
const isOpenRegisterNumberModal = ref(false)

// Fetch numbers on component mount
onMounted(() => {
  fetchNumbers(true)
})

const form = ref({
  name: '',
  phoneNumber: '',
  domain: '',
  port: 5060,
  protocol: 'tcp',
  username: '',
  password: '',
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  domain: z.string().min(1, 'Domain is required'),
  port: z.number()
    .min(1, 'Port must be at least 1')
    .max(65535, 'Port cannot exceed 65535')
    .default(5060),
  protocol: z.enum(['tcp', 'udp']),
  username: z.string(),
  password: z.string(),
})

const columns = [
  {
    accessorKey: 'name',
    header: () => t('phoneTable.name'),
    enableColumnFilter: true
  },
  {
    accessorKey: 'number',
    header: () => t('phoneTable.number'),
  },
  {
    accessorKey: 'id',
    header: () => t('phoneTable.actions'),
    sortable: false,
    width: 100,
    cell: ({ row }) => h(UButton, {
      color: 'error',
      variant: 'ghost',
      icon: 'i-lucide-trash-2',
      size: 'sm',
      onClick: () => handleDelete(row.original)
    })
  }
]

const filteredNumbers = computed(() => {
  if (!searchQuery.value) return numbers.value

  const query = searchQuery.value.toLowerCase()
  return numbers.value.filter(number => 
    number.name.toLowerCase().includes(query) ||
    number.number.toLowerCase().includes(query)
  )
})

const validatePort = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value)
  
  // Ensure the value is within valid port range
  if (value < 1) {
    form.value.port = 1
  } else if (value > 65535) {
    form.value.port = 65535
  } else if (isNaN(value)) {
    form.value.port = 5060
  } else {
    form.value.port = value
  }
}

const handleSubmit = async (event: any) => {
  try {
    isSubmitting.value = true
    const response = await $fetch('/api/numbers', {
      method: 'POST',
      body: {
        ...form.value,
        port: parseInt(form.value.port)
      }
    })

    if (response.success) {
      toast.add({
        title: 'Success',
        description: 'Phone number registered successfully',
        color: 'success',
        icon: 'i-lucide-check'
      })
      
      // Reset form
      Object.keys(form.value).forEach(key => form.value[key as keyof typeof form.value] = '')
      
      // Refresh numbers list
      fetchNumbers(true)
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to register phone number',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (data: any) => {
  try {
    isDeleting.value = true

    console.log(data)
    
    await $fetch(`/api/numbers/${data.id}`, {
      method: 'DELETE'
    })
    
    await fetchNumbers(true)
    
    useToast().add({
      title: 'Success',
      description: 'Phone number deleted successfully',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Failed to delete phone number:', error)
    useToast().add({
      title: 'Error',
      description: error?.data?.message || 'Failed to delete phone number',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
  }
}
</script>
