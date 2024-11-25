export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed the database with initial data'
  },
  async run() {
    console.log('Running DB seed task...')
    const now = new Date()

    // Create test users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@keyreply.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Test User',
        email: 'test@keyreply.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        createdAt: now,
        updatedAt: now
      }
    ]

    const createdUsers = await useDrizzle()
      .insert(tables.users)
      .values(users)
      .returning()
      .all()

    // Create sample calls
    const calls = [
      {
        userId: createdUsers[0].id,
        direction: 'inbound',
        status: 'completed',
        phoneNumber: '+1234567890',
        duration: 300,
        notes: 'Customer inquiry about product features',
        createdAt: now,
        updatedAt: now
      },
      {
        userId: createdUsers[0].id,
        direction: 'outbound',
        status: 'completed',
        phoneNumber: '+1987654321',
        duration: 180,
        notes: 'Follow-up call with client',
        createdAt: now,
        updatedAt: now
      }
    ]

    const createdCalls = await useDrizzle()
      .insert(tables.calls)
      .values(calls)
      .returning()
      .all()

    // Create sample tags
    const tags = [
      {
        callId: createdCalls[0].id,
        name: 'Product Inquiry',
        createdAt: now
      },
      {
        callId: createdCalls[1].id,
        name: 'Follow-up',
        createdAt: now
      }
    ]

    await useDrizzle()
      .insert(tables.callTags)
      .values(tags)
      .run()

    return { 
      result: 'success',
      message: 'Database seeded successfully',
      data: {
        users: createdUsers.length,
        calls: createdCalls.length,
        tags: tags.length
      }
    }
  }
})
