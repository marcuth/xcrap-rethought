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

export class ExtractorNotFoundError extends Error {
    constructor(name: string) {
        super(`Extractor with name "${name}" not found`)
    }
}

export class StaticPaginatorError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "StaticPaginatorError"
    }
}

export class InvalidUrlError extends StaticPaginatorError {
    constructor(url: string) {
        super(`The provided URL does not contain the string {page}: ${url}`)
        this.name = "InvalidUrlError"
    }
}

export class InvalidPageError extends StaticPaginatorError {
    constructor(page: number, minPage: number, lastPage: number) {
        super(`The given page ${page} is outside the allowed range [${minPage}, ${lastPage}]`)
        this.name = "InvalidPageError"
    }
}

export class PageOutOfRangeError extends StaticPaginatorError {
    constructor(page: number, minPage: number, lastPage: number) {
        super(`Page ${page} is outside the allowed range [${minPage}, ${lastPage}]`)
        this.name = "PageOutOfRangeError"
    }
}