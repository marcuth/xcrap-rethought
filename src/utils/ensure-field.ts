import { FieldNotFoundError } from "../core/errors"

export const ensureField = <T>(key: string, data: Record<string, any>): T => {
    if (!(key in data)) {
        throw new FieldNotFoundError(key)
    }

    return data[key]
}