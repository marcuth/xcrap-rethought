export class NotFoundHTMLElement extends Error {
    constructor(query?: string) {
        super(`Element with query "${query || 'no query provided'}" not found`)
    }
}