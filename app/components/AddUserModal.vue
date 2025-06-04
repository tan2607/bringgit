<template>
  <UModal :open="isOpenAddUserModal" @update:open="$emit('update:isOpen', $event)">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Add User</h2>
            <UButton icon="i-heroicons-x-mark" variant="ghost" @click="$emit('update:isOpen', false)" />
          </div>
        </template>

        <UForm :schema="schema" :state="formData" @submit="addUser">
          <div class="flex flex-col gap-4">
            <UFormField label="Name" name="name" required>
              <UInput v-model="formData.name" icon="i-heroicons-user" placeholder="Enter name" />
            </UFormField>

            <UFormField label="Email" name="email" required>
              <UInput v-model="formData.email" icon="i-heroicons-envelope" type="email" placeholder="Enter email" />
            </UFormField>

            <UFormField label="Password" name="password" required>
              <UInput v-model="formData.password" icon="i-heroicons-lock-closed" type="password"
                placeholder="Enter password" />
            </UFormField>

            <UFormField label="Role" name="role" required>
              <USelectMenu v-model="formData.role" :items="['Admin', 'User']" placeholder="Select role" />
            </UFormField>
          </div>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="$emit('update:isOpen', false)">Close</UButton>
            <UButton variant="solid" color="primary" @click="addUser">Add User</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod';

const props = defineProps<{ isOpen: boolean }>();
const isOpenAddUserModal = defineModel<boolean>('isOpen', { required: true });

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required')
});

const formData = ref({ name: '', email: '', password: '', role: '' });

const addUser = () => {
  const validation = schema.safeParse(formData.value);
  if (!validation.success) {
    console.error(validation.error.format());
    return;
  }
  console.log(formData.value);
};
</script>
