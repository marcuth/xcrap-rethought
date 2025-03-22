import { FieldNotFoundError } from "../core/errors"

export const ensureField = <T>(key: string, data: Record<string, any>): T => {
    const hasField = key in data

    if (!hasField) {
        throw new FieldNotFoundError(key)
    }

    return data[key]
}