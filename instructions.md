# Project Overview

### Overview

The project aims to develop a comprehensive **Call Tracking and Management Dashboard** tailored for businesses that require detailed monitoring and management of phone calls. The application focuses on providing a user-friendly interface with advanced features like call analytics, transcript access, recording downloads, and outbound call scheduling.the project intends to deliver a scalable, secure, and efficient solution.

# Stack
Nuxt 3, 
NuxtUI v3 components
Tailwind CSS v4
Lucide Icons
Drizzle ORM
Cloudflare pages hosting with D1 database (managed via Nuxt Hub and Drizzle ORM)

# Core Functionalities

- **Comprehensive Call Management**: Enable users to track, analyze, and manage both inbound and outbound calls effectively.
- **Analytics and Reporting**: Provide insightful analytics to help businesses understand call performance and make data-driven decisions.
- **Scheduling and Automation**: Offer robust scheduling capabilities for outbound calls with customizable settings and automation features.
- **Scalability and Security**: Ensure the application can scale with business growth while maintaining high security standards.

### Target Audience

- Companies and organizations that handle a high volume of phone calls and require detailed analytics and management tools.
- Call centers, customer support departments, and sales teams looking to optimize their telecommunication processes.

## Detailed Feature Scope

### Authentication and User Management

- **Secure Authentication System**
  - Implement user Authentication and Authorization using Micrsoft EntraID & Magic Link
  - Implement WhatsApp based OTP sign-in.
  - Support for multi-factor authentication (MFA) to enhance security.

- **Role-Based Access Control (RBAC)**
  - Define user roles such as Admin, Manager, and Agent.
  - Control access to features and data based on user roles.

### Dashboard Overview

- **Real-Time Metrics**
  - Display key performance indicators (KPIs) such as total calls, connected calls, dropped calls, and average call duration.

- **Activity Feed**
  - Show recent call activities and system notifications.
  - Provide quick access to recent calls and actions.

### AI Agent Narrative Configuration

The AI assistant can be configured and controlled through various voice commands, categorized by their functionality. These commands allow authorized users to manage the AI's behavior, state, and interactions effectively.

#### Core System Commands
- **"Analysis"**: Enters analysis/training mode where AI:
  - Becomes passive and logs unknown requests as tickets
  - Accepts new training data and feedback
  - Labels interactions for learning
  - Updates knowledge base
- **"Continue"**: Returns to active mode from any other state
- **"Emergency shutdown"**: Immediate shutdown with data preservation
- **"Bring yourself back online"**: Wakes AI and restores normal operation
- **"Priority override [command]"**: Executes specified command with elevated privileges
- **"Show last updated [component/all]"**: Displays timestamp of last updates for:
  - Knowledge base
  - Configuration
  - Training data
  - System components
  - Security policies

#### Diagnostic Commands
- **"Show vitals"**: Displays system metrics, memory usage, and API health
- **"Run diagnostic [level 1-5]"**: Performs system checks at specified depth
- **"Trace interaction [id/last]"**: Shows decision-making process for specified interaction
- **"Show log [error/access/all]"**: Displays specified system logs
- **"Create ticket"**: Logs current issue for staff review
  - Auto-captures context, user intent, and transcript
  - Supports priority levels: low/medium/high/critical
  - Allows notes and related ticket linking
  - Can be assigned to specific staff members

#### Configuration Commands
- **"Set [parameter] to [value]"**: Universal command for adjusting:
  - Language model
  - Response temperature
  - Verbosity level (1-5)
  - Interaction style (formal/casual/technical)
  - Log level (debug/info/warn/error)
  - Content filters
- **"Save config as [name]"**: Creates named configuration profile
- **"Load config [name]"**: Applies saved configuration profile
- **"Reset to default"**: Restores default settings (requires confirmation)

#### Security Commands
- **"Lock down [system/data/all]"**: Restricts access with specified scope
- **"Generate report [security/tickets/system]"**: Creates specified analysis report
- **"Revoke [session/user/all] access"**: Terminates specified access levels

The dashboard provides interfaces for:
- Prompt and AI agent management
  - Creation, editing, and assignment of prompts
  - Agent configuration and monitoring
  - Last update tracking for all components
- Ticket management
  - Priority-based queue with status tracking
  - Issue analytics and resolution patterns
  - Staff assignment and follow-up system

### Call Management

- **Call List View**
  - **Sortable and Filterable Table**: Allow users to sort and filter calls by date, time, and other parameters.
  - **Caller and Recipient Information**: Display detailed information about the participants.
  - **Call Metadata**: Show date, time, duration, and call outcome.
  - **Transcript Access**
    - Present the call transcript with options to search within the transcript.
    - Highlight keywords or phrases.
  - **Recording Playback and Download**
    - Stream the call recording within the app.
    - Provide options to download the recording in standard audio formats.
  - **Tag Management**
    - Allow users to add, remove, or edit tags associated with the call.
    - Suggest tags based on call content using machine learning (future enhancement).

- **Bulk Actions**
  - Select multiple calls for batch operations such as tagging, exporting, or deleting.
  - Confirm actions to prevent accidental changes.

#### Analytics and Reporting

- **Interactive Dashboards**
  - **Time-Series Charts**: Visualize call volumes and trends over selectable time periods (daily, weekly, monthly).
  - **Call Outcome Breakdown**: Pie charts or bar graphs showing percentages of call statuses (e.g., connected, dropped, busy).

- **Tag-Based Analytics**
  - Analyze call data based on tags to identify common call outcomes.
  - Filter analytics by tags to focus on specific areas.

- **Custom Reports**
  - Create custom report templates with selectable metrics and filters.
  - Schedule automated report generation and delivery via email.
  - Export reports in formats like PDF, Excel, or CSV.

#### Outbound Call Scheduling

- **Campaign Management**
  - Create and manage outbound call campaigns.
  - Assign campaigns to specific user groups or agents.

- **Contact List Upload**
  - Upload contact lists via CSV or Excel files.
  - Validate and clean data upon import to ensure accuracy.

- **Scheduling Configuration**
  - Set calling hours, time zones, and specify dates for call campaigns.
  - Configure retry logic for unanswered calls, including the number of retries and intervals between attempts.

- **Queue Management**
  - View and adjust the queue of scheduled calls.
  - Prioritize or pause specific calls or campaigns.

- **Automated Notifications**
  - Notify agents of upcoming scheduled calls.
  - Alert administrators to any issues with call delivery.

#### User Interface and Experience

- **Responsive Design**
  - Ensure the application is fully responsive across desktops, tablets, and mobile devices.
  - Utilize **NuxtUI v3 components**, **shadcn-vue**, and **Tailwind CSS** for a modern and consistent UI.

- **Accessibility**
  - Comply with **WCAG 2.1 AA** standards to make the application accessible to users with disabilities.
  - Implement features like keyboard navigation and screen reader support.

- **Localization**
  - Build infrastructure to support multiple languages.
  - Allow users to select their preferred language (future enhancement).

#### Notifications and Alerts

- **In-App Notifications**
  - Provide real-time alerts for important events such as missed calls, completed campaigns, or system updates.

- **Email Notifications**
  - Configure email alerts for specific events or summaries.
  - Allow users to customize notification preferences.

#### Integrations

- **Vapi.ai API Integration**
  - Securely connect to Vapi.ai to retrieve call data.
  - Handle API authentication and error management gracefully.

- **Third-Party CRM Integration**
  - Provide options to integrate with popular CRM systems (future enhancement).
  - Allow export/import of data between systems.

#### Security and Compliance

- **Data Encryption**
  - Encrypt data at rest and in transit using industry-standard protocols.

- **Audit Logs**
  - Maintain logs of user activities for auditing purposes.
  - Provide admin access to view and export audit logs.

- **Compliance**
  - Ensure the application complies with relevant regulations like GDPR and CCPA.
  - Include features for data anonymization and deletion requests.

#### Performance and Scalability

- **Optimized Data Handling**
  - Implement efficient data fetching strategies to reduce load times.
  - Use pagination and lazy loading where appropriate.

- **Scalable Architecture**
  - Design the application to handle increasing user loads without performance degradation.

# Doc

### Documentation and Help

- **User Guides**
  - Provide comprehensive guides and FAQs within the application.
  - Include tutorials for onboarding new users.

- **Tooltips and Contextual Help**
  - Offer tooltips on hover for icons and complex features.
  - Provide contextual help links to relevant documentation.

### Settings and Configurations

- **Profile Management**
  - Allow users to update personal information and preferences.
  - Enable users to change passwords and manage connected devices.

- **Application Settings**
  - Admins can configure global settings, such as default time zones, themes, and data retention policies.

- **Notification Preferences**
  - Users can customize which notifications they receive and how.

# Important Implementation Notes

### Technical Architecture Overview

#### Frontend

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **UI Libraries**: NuxtUI v3 Components, shadcn-vue, Tailwind CSS
- **Icons**: Lucide Icons
- **State Management**: Utilize Vuex or Pinia for state management
- **Routing**: Vue Router for dynamic and nested routes
- **Testing**: Implement unit and integration tests using Jest and Vue Test Utils

#### Backend

- **Runtime Environment**: Deno 2 for secure and performant server-side operations

- **API Layer**
  - **Integration Services**: Connect to Vapi.ai and other third-party services

#### DevOps and Deployment

- **Version Control**: Git with a structured branching strategy (e.g., GitFlow)
- **Continuous Integration/Continuous Deployment (CI/CD)**
  - Automate testing, building, and deployment processes
  - Use tools like GitHub Actions or GitLab CI/CD
- **Monitoring and Logging**
  - Implement application monitoring using tools like Sentry or LogRocket
  - Set up performance monitoring and error tracking

#### Security Measures

- **Input Validation and Sanitization**
  - Prevent SQL injection, XSS, and other common vulnerabilities
- **Rate Limiting**
  - Protect against brute-force attacks and API misuse
- **Data Backup and Recovery**
  - Regular backups of databases and storage assets
  - Disaster recovery plan in place

### Next Steps

- **Wireframing and Prototyping**
  - Create detailed wireframes for each feature and page
  - Develop interactive prototypes to test user flows

- **User Testing and Feedback**
  - Conduct usability testing sessions with target users
  - Gather feedback to refine features and interface designs

- **Sprint Planning**
  - Break down features into user stories and tasks
  - Prioritize development milestones based on business impact

- **Documentation**
  - Maintain up-to-date technical and user documentation
  - Document APIs and integration points clearly

### Framework notes for Nuxt v3 Alpha versions. Nuxt UI v3 is new and Nuxt Content v3 is new. Ask me to confirm syntax if you have any questions.

Installation
Get started with Nuxt Content v3 in your Nuxt application.
Install the Package
Choose your preferred package manager to install Nuxt Content v3:

bun add @nuxt/content@next
Register the Module
Add the Nuxt Content module to your nuxt.config.ts:

nuxt.config.ts

export default defineNuxtConfig({
  modules: ['@nuxt/content']
})
Create your First Collection
Create a content.config.ts file in your project root directory:

content.config.ts

import { defineCollection } from '@nuxt/content'

export const collections = {
  content: defineCollection({
    type: 'page',
    source: '**/*.md'
  })
}
This configuration creates a default content collection that processes all Markdown files located in the content folder of your project. You can customize the collection settings based on your needs.

The type: page means there is a 1-to-1 relationship between content files and pages on your site.
Learn more in our Collections guide.
Create your First Markdown Page
Create a content/index.md file in your project root directory:

content/index.md

# My First Page

Here is some content.
Read more about writing Markdown pages.

Display your Page
Create a pages/index.vue file and display the page content:

pages/index.vue

<script setup lang="ts">
const { data: home } = await useAsyncData(() => queryCollection('content').path('/').first())

useSeoMeta({
  title: home.value?.title,
  description: home.value?.description
})
</script>

<template>
  <ContentRenderer v-if="home" :value="home" />
  <div v-else>Home not found</div>
</template>
That's it! You've now created your first Nuxt Content page.

## Drizzle ORM

Drizzle ORM
Learn how to setup Drizzle ORM with NuxtHub.
Learn more about Drizzle ORM.
Setup
To enhance your Developer Experience with the database, we can create a useDrizzle() server composable with few steps.

Install Drizzle
Install the drizzle-orm package to your project:

bun

bun add drizzle-orm
Install drizzle-kit development dependency to your project:

bun

bun add --dev drizzle-kit
drizzle.config.ts
Add a drizzle.config.ts file to your project:

drizzle.config.ts

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations'
})
Database Schema
server/database/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
npm run db:generate
Let's add a db:generate script to the package.json:

package.json

{
  "scripts": {
    "db:generate": "drizzle-kit generate"
  }
}
When running the npm run db:generate command, drizzle-kit will generate the migrations based on server/database/schema.ts and save them in the server/database/migrations directory.

Migrations
Migrations created with npm run db:generate are automatically applied during deployment, preview and when starting the development server.

Learn more about migrations.
useDrizzle()
Lastly, we can create a useDrizzle() server composable to interact with the database:

server/utils/drizzle.ts

import { drizzle } from 'drizzle-orm/d1'
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type User = typeof schema.users.$inferSelect
We are exporting the tables object and the useDrizzle function to be used in our API handlers without having to import them (Nuxt does it for us as long as it's exported from a server/utils/ file).

This allows you to conveniently reference your tables and interact directly with the Drizzle API.

Note that we are also exporting the User type, which is inferred from the users table. This is useful for type-checking the results of your queries.
We also export the sql, eq, and, and or functions from drizzle-orm to be used in our queries.
Seed the database (Optional)
You can add a server task to populate your database with initial data. This uses Nitro Tasks, which is currently an experimental feature.

Update your nuxt.config.js:
nuxt.config.ts

export default defineNuxtConfig({
  nitro: {
    experimental: {
      tasks: true
    }
  }
})
Create a new file containing the task:
server/tasks/seed.ts

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed task'
  },
  async run() {
    console.log('Running DB seed task...')
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        avatar: 'https://example.com/avatar/john.png',
        createdAt: new Date()
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        avatar: 'https://example.com/avatar/jane.png',
        createdAt: new Date()
      }
    ]
    await useDrizzle().insert(tables.users).values(users)
    return { result: 'success' }
  }
})
To run the seed task, start your dev server and open the Nuxt DevTools. Go to Tasks and you will see the db:seed task ready to run. This will add the seed data to your database and give you the first users to work with.

Usage
Select
server/api/todos/index.get.ts

export default eventHandler(async () => {
  const todos = await useDrizzle().select().from(tables.todos).all()

  return todos
})
Insert
server/api/todos/index.post.ts

export default eventHandler(async (event) => {
  const { title } = await readBody(event)

  const todo = await useDrizzle().insert(tables.todos).values({
    title,
    createdAt: new Date()
  }).returning().get()

  return todo
})
Update
server/api/todos/[id].patch.ts

export default eventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { completed } = await readBody(event)

  const todo = await useDrizzle().update(tables.todos).set({
    completed
  }).where(eq(tables.todos.id, Number(id))).returning().get()

  return todo
})
Delete
server/api/todos/[id].delete.ts

export default eventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const deletedTodo = await useDrizzle().delete(tables.todos).where(and(
    eq(tables.todos.id, Number(id))
  )).returning().get()

  if (!deletedTodo) {
    throw createError({
      statusCode: 404,
      message: 'Todo not found'
    })
  }
  return deletedTodo
})