import { defineCollection } from '@nuxt/content'

export const collections = {
  // Main documentation collection
  docs: defineCollection({
    type: 'page',
    source: 'docs/**/*.md'
  }),
}
