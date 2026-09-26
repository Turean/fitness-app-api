// Shared numeric checks. Written as explicit integer tests rather than
// truthiness so that a legitimate 0 — a bodyweight set's weight — is accepted.

export function isPositiveInt(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) > 0
}

export function isNonNegativeInt(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 0
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== ""
}

// Route ids arrive as strings. Anything that isn't a positive integer
// can't match a row, and passing NaN to Prisma throws rather than
// returning nothing — so callers treat null as "not found".
export function parseId(value: unknown): number | null {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
}
