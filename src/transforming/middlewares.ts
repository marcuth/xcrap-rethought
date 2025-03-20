import * as dateFns from "date-fns"

import { defaultFormattedNumberSuffixes, defaultMinimumFractionDigits } from "../constants"
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

const numberToInteger = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<number>(key, data)
        return await next({ ...data, [key]: Math.floor(fieldValue) })
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

const stringDateToISO = (key: string, dateStringTemplate: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const date = dateFns.parse(fieldValue, dateStringTemplate, new Date()).toISOString()
        return await next({ ...data, [key]: date })
    }
}

const stringDateToTimestamp = (key: string, dateStringTemplate: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const timestamp = dateFns.parse(fieldValue, dateStringTemplate, new Date()).getTime()
        return await next({ ...data, [key]: timestamp })
    }
}

const stringDateToObject = (key: string, dateStringTemplate: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const dateObject = dateFns.parse(fieldValue, dateStringTemplate, new Date())
        return await next({ ...data, [key]: dateObject })
    }
}

const removeHtmlTags = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const clean = fieldValue.replace(/<\/?[^>]+(>|$)/g, "")
        return await next({ ...data, [key]: clean })
    }
}

const sanitizeString = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const sanitized = fieldValue.replace(/[^a-zA-Z0-9\s]/g, "").trim()
        return await next({ ...data, [key]: sanitized })
    }
}

const collapseWhitespace = (key: string): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const collapsed = fieldValue.replace(/\s+/g, " ").trim()
        return await next({ ...data, [key]: collapsed })
    }
}

const parseCurrency = (key: string, options: ParseCurrencyOptions): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        let cleanedValue = fieldValue

        if (options.currencySymbol) {
            cleanedValue = cleanedValue.replace(new RegExp(`\\${options.currencySymbol}`, "g"), "")
        }

        cleanedValue = cleanedValue.replace(/[,]/g, "").trim()
        const num = Number(cleanedValue)
        return await next({ ...data, [key]: isNaN(num) ? null : num })
    }
}

const formatCurrency = (key: string, options: FormatCurrencyOptions): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<number>(key, data)
        const formatted = new Intl.NumberFormat(options.locale, {
            style: "currency",
            currency: options.currencyCode,
            minimumFractionDigits: options.minimumFractionDigits ?? defaultMinimumFractionDigits,
        }).format(fieldValue)
        return await next({ ...data, [key]: formatted })
    }
}

const parseFormattedNumber = (
    key: string,
    options?: ParseFormattedNumberOptions
): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<string>(key, data)
        const sanitizeNumberString = options?.sanitizeNumberString ?? (
            (value: string) => value.toLowerCase().replace(",", ".").trim()
        )
        const value = sanitizeNumberString(fieldValue)
        const suffixes = options?.suffixes || defaultFormattedNumberSuffixes

        for (const [suffix, multiplier] of Object.entries(suffixes)) {
            if (value.endsWith(suffix)) {
                const num = Number(value.replace(suffix, "").trim()) * multiplier
                return await next({ ...data, [key]: isNaN(num) ? options?.defaultValue ?? null : num })
            }
        }

        const num = Number(value)
        return await next({ ...data, [key]: isNaN(num) ? options?.defaultValue ?? null : num })
    }
}

const stopIf = (key: string, condition: (value: any) => boolean): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<any>(key, data)
        if (condition(fieldValue)) return data
        return await next(data)
    }
}

const skipIf = (
    key: string,
    condition: (value: any) => boolean
): TransformerMiddlewareFunction => {
    return async (data, next) => {
        const fieldValue = ensureField<any>(key, data)
        if (condition(fieldValue)) return data
        return await next(data)
    }
}

const stopIfStringIncludes = (
    key: string,
    substring: string
): TransformerMiddlewareFunction => stopIf(key, (value) => value.includes(substring))

const skipIfStringIncludes = (
    key: string,
    substring: string
): TransformerMiddlewareFunction  => skipIf(key, (value) => value.includes(substring))

const stopIfArrayIncludes = (
    key: string,
    item: any
): TransformerMiddlewareFunction => stopIf(key, (value) => value.includes(item))

const skipIfArrayIncludes = (
    key: string,
    item: any
): TransformerMiddlewareFunction  => skipIf(key, (value) => value.includes(item))


const skipIfObjectIncludes = (
    key: string,
    fields: string[]
): TransformerMiddlewareFunction => skipIf(key, (value) => fields.some(field => field in value))

const stopIfObjectIncludes = (
    key: string,
    fields: string[]
): TransformerMiddlewareFunction => stopIf(key, (value) => fields.some(field => field in value))

export {
    stringToUpperCase,
    stringToLowerCase,
    stringToTitleCase,
    toNumber,
    toString,
    numberToInteger,
    stringToBoolean,
    trimString,
    stringSplit,
    normalizeString,
    customMiddleware,
    stringDateToISO,
    stringDateToTimestamp,
    stringDateToObject,
    removeHtmlTags,
    sanitizeString,
    collapseWhitespace,
    parseCurrency,
    formatCurrency,
    parseFormattedNumber,
    stopIf,
    skipIf,
    stopIfStringIncludes,
    skipIfStringIncludes,
    stopIfArrayIncludes,
    skipIfArrayIncludes,
    skipIfObjectIncludes,
    stopIfObjectIncludes
}