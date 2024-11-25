import { defineCollection } from '@nuxt/content'

export const collections = {
  // Main documentation collection
  docs: defineCollection({
    type: 'page',
    source: 'docs/**/*.md'
  }),
  // Instructions and guides
  instructions: defineCollection({
    type: 'page',
    source: 'instructions/**/*.md'
  }),
  // API documentation
  api: defineCollection({
    type: 'page',
    source: 'api/**/*.md'
  })
}
