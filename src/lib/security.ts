/**
 * Security utilities for input validation and sanitization
 * Protects against SQL/NoSQL injection, XSS, and other attacks
 */

/**
 * Sanitize and validate phone number input
 * Allows only digits, spaces, +, -, (, )
 */
export function sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') return ''

    // Remove any characters that aren't digits, spaces, +, -, (, )
    const cleaned = input.replace(/[^\d\s+\-()]/g, '')

    // Limit length to prevent DoS
    return cleaned.substring(0, 20)
}

/**
 * Normalize phone number for consistent storage and hashing
 * Converts 87... to 77...
 * Removes non-digits
 */
export function normalizePhone(input: string): string {
    if (!input || typeof input !== 'string') return ''
    let cleaned = input.replace(/\D/g, '')

    // Handle KZ/RU definitions: 11 digits starting with 8 -> convert to 7
    if (cleaned.length === 11 && cleaned.startsWith('8')) {
        cleaned = '7' + cleaned.substring(1)
    }

    // Handle 10 digits (missing country code) -> add 7
    if (cleaned.length === 10) {
        cleaned = '7' + cleaned
    }

    return cleaned
}

/**
 * Sanitize company name
 * Removes special characters that could be used for injection
 */
export function sanitizeCompanyName(input: string): string {
    if (!input || typeof input !== 'string') return ''

    // Remove any potentially dangerous characters
    const cleaned = input
        .replace(/[<>{}[\]\\]/g, '') // Remove brackets and backslashes
        .replace(/[$]/g, '') // Remove $ (MongoDB operator)
        .trim()

    // Limit length
    return cleaned.substring(0, 200)
}

/**
 * Sanitize description text
 * Removes XSS vectors and MongoDB operators
 */
export function sanitizeDescription(input: string): string {
    if (!input || typeof input !== 'string') return ''

    // Remove script tags and MongoDB operators
    const cleaned = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/[$]/g, '') // Remove $ (MongoDB operator)
        .trim()

    // Limit length
    return cleaned.substring(0, 1000)
}

/**
 * Validate and sanitize search query
 * Protects against NoSQL injection in search operations
 */
export function sanitizeSearchQuery(input: string): string {
    if (!input || typeof input !== 'string') return ''

    // For phone searches, keep only valid phone characters
    // For company searches, remove dangerous operators
    const cleaned = input
        .replace(/[$]/g, '') // Remove MongoDB operator
        .replace(/[{}]/g, '') // Remove curly braces
        .replace(/[\[\]]/g, '') // Remove square brackets
        .trim()

    // Limit length to prevent DoS
    return cleaned.substring(0, 100)
}

/**
 * Validate MongoDB ObjectId format
 * Prevents injection through ID fields
 */
export function isValidObjectId(id: string): boolean {
    if (!id || typeof id !== 'string') return false
    return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Sanitize fraud type selection
 * Ensures only valid fraud types are accepted
 */
export function sanitizeFraudType(input: string): string {
    const validTypes = [
        'phishing',
        'vishing',
        'smishing',
        'impersonation',
        'investment',
        'loan',
        'crypto',
        'fake_sale',
        'fake_shop',
        'rental',
        'prize',
        'other'
    ]

    if (!input || typeof input !== 'string') return 'other'

    const normalized = input.toLowerCase().trim()
    return validTypes.includes(normalized) ? normalized : 'other'
}

/**
 * Rate limiting helper - simple in-memory implementation
 * In production, use Redis or similar
 */
const requestCounts = new Map<string, { count: number, resetAt: number }>()

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000
): { allowed: boolean, remaining: number } {
    const now = Date.now()
    const record = requestCounts.get(identifier)

    if (!record || now > record.resetAt) {
        requestCounts.set(identifier, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: maxRequests - 1 }
    }

    if (record.count >= maxRequests) {
        return { allowed: false, remaining: 0 }
    }

    record.count++
    return { allowed: true, remaining: maxRequests - record.count }
}

/**
 * Clean up old rate limit records periodically
 */
setInterval(() => {
    const now = Date.now()
    for (const [key, record] of Array.from(requestCounts.entries())) {
        if (now > record.resetAt) {
            requestCounts.delete(key)
        }
    }
}, 300000) // Every 5 minutes

/**
 * Escape regex special characters
 * Prevents ReDoS attacks
 */
export function escapeRegex(input: string): string {
    if (!input || typeof input !== 'string') return ''
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validate request origin (CSRF protection helper)
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
    if (!origin) return false
    return allowedOrigins.some(allowed => origin === allowed || origin.endsWith(allowed))
}
