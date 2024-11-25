<template>
  <div class="documentation-page">
    <div class="flex">
      <!-- Sidebar with navigation -->
      <aside class="w-64 h-screen sticky top-0 pt-16 pr-4 hidden lg:block">
        <ContentNavigation v-slot="{ navigation }" :query="{ type: 'page' }">
          <UTree
            :items="navigation"
            default-open
            class="mt-4"
          />
        </ContentNavigation>
      </aside>

      <!-- Main content -->
      <main class="min-h-screen w-full max-w-5xl px-6 py-16">
        <ContentDoc v-slot="{ doc }">
          <ContentRenderer :value="doc">
            <template #empty>
              <p>No content found.</p>
            </template>
          </ContentRenderer>

          <!-- Table of contents -->
          <div v-if="doc.toc?.links?.length" class="toc fixed right-0 top-16 w-64 p-6 hidden xl:block">
            <ContentToc :links="doc.toc.links" />
          </div>

          <!-- Navigation between pages -->
          <div v-if="doc" class="flex justify-between mt-8 pt-8 border-t">
            <PrevNext :prev="doc.prev" :next="doc.next" />
          </div>
        </ContentDoc>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Navigation between pages component
const PrevNext = defineComponent({
  props: {
    prev: { type: Object, default: null },
    next: { type: Object, default: null }
  },
  setup(props) {
    return () => (
      <div class="flex justify-between w-full">
        {props.prev && (
          <UButton
            to={props.prev._path}
            variant="ghost"
            class="flex items-center"
          >
            <div class="mr-2">←</div>
            <span>{props.prev.title}</span>
          </UButton>
        )}
        {props.next && (
          <UButton
            to={props.next._path}
            variant="ghost"
            class="flex items-center ml-auto"
          >
            <span>{props.next.title}</span>
            <div class="ml-2">→</div>
          </UButton>
        )}
      </div>
    )
  }
})
</script>

<style>
.documentation-page {
  @apply mx-auto;
}

.prose {
  @apply max-w-none;
}

.toc {
  @apply text-sm;
}

.toc a {
  @apply text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200;
}

.toc a.active {
  @apply text-primary-500 font-medium;
}
</style>
