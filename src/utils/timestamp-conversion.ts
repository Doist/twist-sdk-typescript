/**
 * Converts a Unix timestamp (in seconds) to a Date object.
 * @param timestamp - Unix timestamp in seconds
 * @returns Date object
 */
export function timestampToDate(timestamp: number): Date {
    return new Date(timestamp * 1000)
}

/**
 * Recursively transforms all timestamp fields (ending in 'Ts') in an object to Date objects.
 * Also renames the fields by removing the 'Ts' suffix.
 * @param obj - The object to transform
 * @returns The transformed object with Date fields
 */
export function transformTimestamps<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => transformTimestamps(item)) as T
    }

    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(obj)) {
            // Check if the key ends with 'Ts' and the value is a number
            if (key.endsWith('Ts') && typeof value === 'number') {
                // Remove 'Ts' suffix and convert to Date
                const newKey = key.slice(0, -2)
                result[newKey] = timestampToDate(value)
            } else if (typeof value === 'object' && value !== null) {
                // Recursively transform nested objects
                result[key] = transformTimestamps(value)
            } else {
                result[key] = value
            }
        }

        return result as T
    }

    return obj
}
