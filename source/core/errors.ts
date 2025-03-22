export class InvalidStatusCodeError extends Error {
    public statusCode: number
    public url?: string

    constructor(statusCode: number, url?: string) {
        super(`Request failed with invalid status code: ${statusCode}`)
        this.statusCode = statusCode
        this.url = url

        Object.setPrototypeOf(this, InvalidStatusCodeError.prototype)
    }
}

export class HTMLElementNotFoundError extends Error {
    constructor(query?: string) {
        super(`Element with query "${query || 'no query provided'}" not found`)
        this.name = "HTMLElementNotFoundError"
    }
}

export class MultipleQueryError extends Error {
    constructor() {
        super("Multiple value must have a 'query'")
        this.name = "MultipleQueryError"
    }
}

export class FieldNotFoundError extends Error {
    constructor(key: string) {
        super(`Field with key "${key}" not found`)
    }
}