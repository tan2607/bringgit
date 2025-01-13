<template>
  <div class="space-y-6">
    <!-- Current Phone Numbers List -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Phone Numbers</h3>
          <div class="flex gap-2">
            <UPopover :popper="{ placement: 'bottom-end' }" mode="click">
              <UButton
                color="primary"
                icon="i-lucide-plus"
                label="New Number"
              />
              
              <template #content="{ close }">
                <div class="p-4 w-[400px]">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Register New Phone Number</h3>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-x"
                      @click="close"
                    />
                  </div>

                  <UForm 
                    :state="form"
                    :schema="schema"
                    @submit="handleSubmit" 
                    class="space-y-4"
                  >
                    <UFormField 
                      label="Name" 
                      name="name"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.name"
                        placeholder="Enter name"
                      />
                    </UFormField>

                    <UFormField 
                      label="Phone Number" 
                      name="phoneNumber"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.phoneNumber"
                        placeholder="Enter phone number"
                      />
                    </UFormField>

                    <UFormField 
                      label="Username (Optional)" 
                      name="username"
                    >
                      <UInput
                        class="w-full"
                        v-model="form.username"
                        placeholder="Enter username"
                      />
                    </UFormField>

                    <UFormField 
                      label="Password (Optional)" 
                      name="password"
                    >
                      <UInput
                        class="w-full"
                        v-model="form.password"
                        type="password"
                        placeholder="Enter password"
                      />
                    </UFormField>

                    <UFormField 
                      label="Domain / IP" 
                      name="domain"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.domain"
                        placeholder="Enter domain or IP address"
                      />
                    </UFormField>

                    <UFormField
                      label="Port"
                      name="port"
                      required
                    >
                      <UInput
                        class="w-full"
                        v-model="form.port"
                        type="number"
                        placeholder="Enter port (default: 5060)"
                      />
                    </UFormField>

                    <UFormField
                      label="Protocol"
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
                        Register
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
            placeholder="Filter by name or number..."
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

const { numbers, isLoading, fetchNumbers } = usePhoneNumbers()
const toast = useToast()
const isSubmitting = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')
const UButton = resolveComponent('UButton');

// Fetch numbers on component mount
onMounted(() => {
  fetchNumbers(true)
})

const form = ref({
  name: '',
  phoneNumber: '',
  domain: '',
  port: '5060',
  protocol: 'tcp',
  username: '',
  password: '',
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  domain: z.string().min(1, 'Domain is required'),
  port: z.string().regex(/^\d+$/, 'Port must be a number').transform(Number),
  protocol: z.enum(['tcp', 'udp']),
  username: z.string(),
  password: z.string(),
})

const columns = [
  {
    accessorKey: 'name',
    header: () => 'Name',
    enableColumnFilter: true
  },
  {
    accessorKey: 'number',
    header: () => 'Number'
  },
  {
    accessorKey: 'id',
    header: () => 'Actions',
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

const handleSubmit = async (event: any) => {
  try {
    isSubmitting.value = true
    const response = await $fetch('/api/numbers', {
      method: 'POST',
      body: form.value
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
