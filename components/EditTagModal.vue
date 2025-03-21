<template>
  <UModal
    :open="isOpenEditTagModal"
    @update:open="$emit('update:isOpen', $event)"
  >
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Edit Review</h2>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              @click="$emit('update:isOpen', false)"
            />
          </div>
        </template>
        <div>
          <UAccordion
            :items="
              categories.map((category) => ({
                label: category.charAt(0).toUpperCase() + category.slice(1),
                value: category,
              }))
            "
            type="multiple"
            :default-value="Array.from(tagMapping.keys())"
          >
            <template #body="{ item }">
              <ul class="space-y-2 flex flex-wrap gap-2">
                <li
                  v-for="option in getFilteredOptions(item.value)"
                  :key="option"
                >
                  <UButton
                    variant="outline"
                    class="w-full text-left cursor-pointer"
                    :color="
                      tagMapping.get(item.value)?.includes(option)
                        ? 'success'
                        : 'neutral'
                    "
                    @click="handleChooseValue(option, item.value)"
                  >
                    {{ option }}
                  </UButton>
                </li>
              </ul>
            </template>
          </UAccordion>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="solid" color="primary" @click="saveTags">Save</UButton>
            <UButton variant="ghost" @click="$emit('update:isOpen', false)"
              >Close</UButton
            >
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const isOpenEditTagModal = defineModel<boolean>("isOpen", { required: true });
const props = defineProps<{
  categories: any[];
  uniqueTags: string[];
  selectedCall: Call;
}>();
const emit = defineEmits(['updateTags', 'update:isOpen']);

const tagMapping = ref<Map<string, string[]>>(new Map<string, string[]>());

const handleChooseValue = (value: string, category: string) => {
  if (!tagMapping.value.has(category)) {
    tagMapping.value.set(category, []);
  }
  if (tagMapping.value.get(category)?.includes(value)) {
    tagMapping.value
      .get(category)
      ?.splice(tagMapping.value.get(category)?.indexOf(value), 1);
  } else {
    tagMapping.value.set(category, [value]);
  }
};

const getFilteredOptions = (category: string) => {
  return props.uniqueTags.filter((option) => option.startsWith(`${category}:`)).map((option) => option.split(":")[1]);
}

const saveTags = () => {
  emit('updateTags', tagMapping.value);
  isOpenEditTagModal.value = false;
}


onMounted(() => {
  if (props.selectedCall.tags) {
    props.selectedCall.tags.forEach((tag) => {
      const [category, value] = tag.split(":");
      if (!tagMapping.value.has(category)) {
        tagMapping.value.set(category, []);
      }
      tagMapping.value.get(category)?.push(value);
    });
  }
});
</script>
