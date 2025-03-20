export class FieldNotFoundError extends Error {
    constructor(key: string) {
        super(`Field with key "${key}" not found`)
    }
}