// Shared numeric checks. Written as explicit integer tests rather than
// truthiness so that a legitimate 0 — a bodyweight set's weight — is accepted.

export function isPositiveInt(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) > 0
}

export function isNonNegativeInt(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 0
}
