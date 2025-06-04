#!/usr/bin/env bun

/**
 * Script to extract variable placeholders from a prompt template
 * and verify they exist in the variable schema
 */

import { promises as fs } from 'fs'
import path from 'path'
import { flattenVariables, defaultCallVariables } from '../server/utils/variableSchema'

// Configuration
const promptsDir = path.resolve(process.cwd(), 'prompts')
const variableSchema = flattenVariables(defaultCallVariables)

/**
 * Extract variable placeholders from a markdown prompt template
 * @param {string} content - The prompt template content
 * @returns {string[]} - Array of unique variable placeholders
 */
function extractVariablePlaceholders(content: string): string[] {
  // Match any {{variable_name}} patterns
  const regex = /\{\{([^}]+)\}\}/g
  const matches = []
  let match

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1].trim())
  }

  // Return unique values
  return [...new Set(matches)]
}

/**
 * Check if variables in the prompt exist in our schema
 * @param {string[]} promptVariables - Variables used in the prompt
 * @param {object} variableSchema - The flattened variable schema
 * @returns {object} - Results of the check
 */
function verifyVariables(promptVariables: string[], variableSchema: Record<string, string>) {
  const missingVariables = []
  const availableVariables = Object.keys(variableSchema)

  for (const variable of promptVariables) {
    if (!availableVariables.includes(variable) && variable !== 'json') {
      missingVariables.push(variable)
    }
  }

  return {
    total: promptVariables.length,
    missing: missingVariables,
    missingCount: missingVariables.length,
    valid: promptVariables.length - missingVariables.length
  }
}

/**
 * Process a prompt file to check variable usage
 * @param {string} filePath - Path to the prompt file
 */
async function processPromptFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const variables = extractVariablePlaceholders(content)
    const results = verifyVariables(variables, variableSchema)

    console.log(`\nFile: ${path.basename(filePath)}`)
    console.log(`Total variables: ${results.total}`)
    console.log(`Valid variables: ${results.valid}`)
    
    if (results.missingCount > 0) {
      console.log('\nMissing variables:')
      results.missing.forEach(variable => {
        console.log(`  - {{${variable}}}`)
      })
    }

    return results
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return null
  }
}

/**
 * Find all prompt files in a directory (recursively)
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findPromptFiles(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir, { withFileTypes: true })
  
  const promptFiles = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file.name)
      
      if (file.isDirectory()) {
        return findPromptFiles(filePath)
      } 
      
      if (file.name.endsWith('.md')) {
        return [filePath]
      }
      
      return []
    })
  )
  
  return promptFiles.flat()
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔍 Variable Checker for Prompt Templates')
    console.log('=======================================')
    
    // Find all prompt files
    const promptFiles = await findPromptFiles(promptsDir)
    console.log(`Found ${promptFiles.length} prompt files`)
    
    // Process each file
    let totalMissing = 0
    for (const file of promptFiles) {
      const result = await processPromptFile(file)
      if (result) {
        totalMissing += result.missingCount
      }
    }
    
    console.log('\n=======================================')
    if (totalMissing > 0) {
      console.log(`⚠️  Found ${totalMissing} missing variables across all prompts`)
      console.log('\nUpdate the variable schema in server/utils/variableSchema.ts to include these variables')
    } else {
      console.log('✅ All variables in prompts are valid!')
    }
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Run the main function
main()
