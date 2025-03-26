import { camelCase, capitalCase, dotCase, constantCase, kebabCase, noCase, pascalCase, pascalSnakeCase, pathCase, sentenceCase, snakeCase, trainCase } from "change-case"
import * as dateFns from "date-fns"

export type FormatCurrencyOptions = {
    locale: string
    currencyCode: string
    minimumFractionDigits: number
}

export const transformers = {
    string: {
        trim: (value: string) => value.trim(),
        toUpperCase: (value: string) => value.toUpperCase(),
        toLowerCase: (value: string) => value.toLowerCase(),
        toCamelCase: camelCase,
        toCapitalCase: capitalCase,
        toDotCase: dotCase,
        toConstantCase: constantCase,
        toKebabCase: kebabCase,
        toNoCase: noCase,
        toPascalCase: pascalCase,
        toPascalSnakeCase: pascalSnakeCase,
        toPathCase: pathCase,
        toSentenceCase: sentenceCase,
        toSnakeCase: snakeCase,
        toTrainCase: trainCase,
        toNumber: Number,
        split: (separator: string) => (value: string) => value.split(separator),
        toBoolean: (value: string) => {
            const truthyValues = ["true", "1", "yes"]
            const falsyValues = ["false", "0", "no"]
            const lowerValue = value.toLowerCase()

            if (truthyValues.includes(lowerValue)) {
                return true
            }

            if (falsyValues.includes(lowerValue)) {
                return false
            }

            throw new Error(`'${value}' cannot be converted to boolean!`)
        },
        normalize: (value: string) => {
            return value
                .normalize("NFD")
                .toLowerCase()
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
        },
        removeHtmlTags: (value: string) => value.replace(/<\/?[^>]+(>|$)/g, ""),
        sanetize: (value: string) => value.replace(/[^a-zA-Z0-9\s]/g, "").trim(),
        collapseWhitespace: (value: string) => value.replace(/\s+/g, " ").trim(),
        currencyToNumber: (currencySymbol?: string) => (value: string) => {
            let cleanedValue = value

            if (currencySymbol) {
                cleanedValue = cleanedValue.replace(new RegExp(`\\${currencySymbol}`, "g"), "")
            }

            cleanedValue = cleanedValue.replace(/[,]/g, "").trim()
            const number = Number(cleanedValue)

            return number
        }
    },
    date: {
        fromString: (template: string) => (value: string) => {
            return dateFns.parse(value, template, new Date())
        },
        fromTimestamp: (value: number) => {
            return new Date(value)
        },
        toISO: (value: Date) => value.toISOString(),
        toTimestamp: (value: Date) => value.getTime(),
        format: (template: string) => (value: Date) => {
            return dateFns.format(value, template)
        }
    },
    number: {
        toString: (value: number) => value.toString(),
        toInteger: (value: number) => Math.floor(value),
        formatCurrency: ({
            currencyCode,
            locale,
            minimumFractionDigits
        }: FormatCurrencyOptions) => {
            return (value: number) => {
                const formatter = new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: currencyCode,
                    minimumFractionDigits: minimumFractionDigits,
                })
    
                return formatter.format(value)
            }
        }
    },
    array: {
        join: (separator: string) => (value: string[]) => value.join(separator)
    }
}

export const validators = {
    string: {
        includes: (str: string) => (value: string) => value.includes(str),
        isNumeric: (value: string) => !isNaN(Number(value))
    },
    array: {
        includes: (item: any) => (value: any[]) => value.includes(item)
    }
}

export type TransformOptions<T, R> = {
    key: string,
    transformer: (value: T) => R | Promise<R>,
    condition?: (value: T) => boolean | Promise<boolean>
}

export function transform<T extends any, R extends any>({
    key,
    transformer,
    condition
}: TransformOptions<T, R>) {
    return async (data: Record<string, any>) => {
        const value = data[key] as T
        const isValid = condition ? await condition(value) : true

        if (!isValid) {
            return value
        }

        const transformedValue = await transformer(value)

        return transformedValue as R
    }
}