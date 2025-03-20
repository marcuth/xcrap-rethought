export class HTMLElementNotFoundError extends Error {
    constructor(query?: string) {
        super(`Element with query "${query || 'no query provided'}" not found`)
        this.name = "HTMLElementNotFoundError"
    }
}

export class GroupQueryError extends Error {
    constructor() {
        super("Group value must have a 'query'")
        this.name = "GroupQueryError"
    }
}