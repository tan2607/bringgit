#!/usr/bin/env bun

/**
 * Brightree API Connection Test Script
 * 
 * This script tests the connection to the Brightree API and performs
 * basic operations to verify functionality.
 * 
 * Usage:
 * bun run scripts/test-brightree.js
 */

import testBrightreeConnection from '../server/utils/tests/brightree-test'

console.log('🔍 Brightree API Connection Test')
console.log('================================\n')

testBrightreeConnection()
  .then(result => {
    if (result.success) {
      console.log('\n✅ TEST PASSED: Brightree API connection is working correctly')
      
      if (result.availableSlots && result.availableSlots.length > 0) {
        console.log('\n📊 Summary of Available Appointment Slots:')
        console.log(`   - Total available dates: ${result.availableSlots.length}`)
        
        // Count total available time slots across all dates
        const totalTimeSlots = result.availableSlots.reduce(
          (total, slot) => total + slot.availableTimes.length, 
          0
        )
        console.log(`   - Total available time slots: ${totalTimeSlots}`)
        
        // Show date with most available slots
        const dateWithMostSlots = result.availableSlots.reduce(
          (max, slot) => slot.availableTimes.length > max.count 
            ? { date: slot.date, count: slot.availableTimes.length } 
            : max, 
          { date: '', count: 0 }
        )
        
        if (dateWithMostSlots.date) {
          console.log(`   - Date with most availability: ${dateWithMostSlots.date} (${dateWithMostSlots.count} slots)`)
        }
      }
    } else {
      console.error('\n❌ TEST FAILED: Could not connect to Brightree API')
      console.error(`   Error: ${result.error}`)
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ FATAL ERROR:', error)
    process.exit(1)
  })
