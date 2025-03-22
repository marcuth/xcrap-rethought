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