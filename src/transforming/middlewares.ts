import { ensureField } from "../utils/ensure-field"

export type StringToBooleanOptions = {
    truthy?: string[]
    falsy?: string[]
    default?: boolean | null
}

export type ParseCurrencyOptions = {
    currencySymbol?: string
}

export type FormatCurrencyOptions = {
    locale: string
    currencyCode: string
    minimumFractionDigits?: number
}

export type ParseFormattedNumberOptions = {
    suffixes?: Record<string, number>
    defaultValue?: number | null
    sanitizeNumberString?: (value: string) => string
}

export type NextFunction = (nextContext?: Partial<any>) => any

export type TransformerMiddlewareFunction = (
    data: any,
    next: NextFunction
) => Promise<any> | any

export type CustomMiddlewareTransformFunction = (value: any) => any



const stringToUpperCase = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        return await next({ ...data, [key]: fieldValue.toUpperCase() })
    }
}

const stringToLowerCase = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        return await next({ ...data, [key]: fieldValue.toLowerCase() })
    }
}

const stringToTitleCase = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const titleCase = fieldValue
            .toLowerCase()
            .replace(/(^\w{1})|(\s+\w{1})/g, (char) => char.toUpperCase())
        return await next({ ...data, [key]: titleCase })
    }
}

const toNumber = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const num = Number(fieldValue)
        return await next({ ...data, [key]: isNaN(num) ? null : num })
    }
}

const toString = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<any>(key, data)
        return await next({ ...data, [key]: String(fieldValue) })
    }
}

const toInteger = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<number | string>(key, data)
        const num = Number(fieldValue)
        return await next({ ...data, [key]: isNaN(num) ? null : Math.floor(num) })
    }
}

const stringToBoolean = (key: string, options?: StringToBooleanOptions): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const truthyValues = options?.truthy || ["true", "1", "yes"]
        const falsyValues = options?.falsy || ["false", "0", "no"]
        const lowerValue = fieldValue.toLowerCase()

        if (truthyValues.includes(lowerValue)) return await next({ ...data, [key]: true })
        if (falsyValues.includes(lowerValue)) return await next({ ...data, [key]: false })
        return await next({ ...data, [key]: options?.default ?? null })
    }
}

const trimString = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        return await next({ ...data, [key]: fieldValue.trim() })
    }
}

const stringSplit = (key: string, separator: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        return await next({ ...data, [key]: fieldValue.split(separator) })
    }
}

const normalizeString = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const normalized = fieldValue
            .normalize("NFD")
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
        
        return await next({ ...data, [key]: normalized })
    }
}

const customMiddleware = (
    key: string,
    transform: CustomMiddlewareTransformFunction
): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<any>(key, data)
        return await next({ ...data, [key]: transform(fieldValue) })
    }
}