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