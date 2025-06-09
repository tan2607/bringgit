<template>
  <UModal v-model:open="isOpenEditReviewModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Edit Your Review</h2>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="lg"
              @click="$emit('update:isOpen', false)" />
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-600">Write your feedback below:</p>
          <UInput v-model="review" placeholder="Type your review..." class="w-full" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" color="gray" @click="$emit('update:isOpen', false)" :loading="isLoading">Cancel
            </UButton>
            <UButton variant="solid" color="primary" @click="saveReview" :loading="isLoading">Submit Review</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const isOpenEditReviewModal = defineModel<boolean>("isOpen", { required: true });
const props = defineProps<{ selectedCall: Call, isLoading: boolean }>();

const review = ref("");

const emit = defineEmits<{ (e: "update:isOpen", value: boolean): void, (e: "updateReview", value: string): void }>();

const saveReview = () => {
  emit('updateReview', review.value);
};

onMounted(() => {
  if (props.selectedCall.review) {
    review.value = props.selectedCall.review;
  }
});
</script>
