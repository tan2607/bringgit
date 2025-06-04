import { z, ZodTypeAny, ZodObject, ZodString, ZodNumber, ZodEnum, ZodArray, ZodOptional } from 'zod'

/**
 * Generates a human-readable description of a Zod schema
 * @param schema The Zod schema to describe
 * @param indent Indentation level for nested objects
 * @returns A string description of the schema
 */
export function describeSchema(schema: ZodTypeAny, indent = ''): string {
  if (schema instanceof ZodObject) {
    const shape = schema._def.shape()
    const descriptions = Object.entries(shape).map(([key, value]) => {
      return `${indent}${key}: ${describeSchema(value, indent + '  ')}`
    })
    return `{\n${descriptions.join('\n')}\n${indent}}`
  }

  if (schema instanceof ZodString) {
    const constraints = []
    if (schema._def.checks) {
      for (const check of schema._def.checks) {
        if (check.kind === 'min') constraints.push(`min length: ${check.value}`)
        if (check.kind === 'max') constraints.push(`max length: ${check.value}`)
        if (check.kind === 'regex') constraints.push(`format: ${check.regex}`)
        if (check.kind === 'email') constraints.push('email format')
      }
    }
    return `string${constraints.length ? ` (${constraints.join(', ')})` : ''}`
  }

  if (schema instanceof ZodNumber) {
    const constraints = []
    if (schema._def.checks) {
      for (const check of schema._def.checks) {
        if (check.kind === 'min') constraints.push(`min: ${check.value}`)
        if (check.kind === 'max') constraints.push(`max: ${check.value}`)
        if (check.kind === 'int') constraints.push('integer')
      }
    }
    return `number${constraints.length ? ` (${constraints.join(', ')})` : ''}`
  }

  if (schema instanceof ZodEnum) {
    return `enum: ${schema._def.values.join(' | ')}`
  }

  if (schema instanceof ZodArray) {
    return `array of ${describeSchema(schema._def.type, indent + '  ')}`
  }

  if (schema instanceof ZodOptional) {
    return `optional ${describeSchema(schema._def.innerType, indent)}`
  }

  return 'any'
}

/**
 * Extracts JSON data from a text response
 * @param text The text containing JSON data
 * @returns The parsed JSON object or null if no valid JSON found
 */
export function extractJsonFromText(text: string): any | null {
  // Try to extract JSON from markdown code blocks first
  const markdownMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/)
  if (markdownMatch) {
    try {
      return JSON.parse(markdownMatch[1].trim())
    } catch {
      // If parsing fails, continue to try other methods
    }
  }

  // Try to extract any JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      return null
    }
  }

  return null
}

/**
 * Validates data against a schema and returns a formatted error message
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns An object containing validation result and any error messages
 */
export function validateWithSchema<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): { success: boolean; data?: z.infer<T>; error?: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')
      return { success: false, error: errorMessages }
    }
    return { success: false, error: 'Invalid data format' }
  }
}
