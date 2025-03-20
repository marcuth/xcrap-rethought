import { HttpResponse } from "./response"

export type ClientRequestOptions = {
    url: string
    method: string
    retries?: number
    maxRetries?: number
    retryDelay?: number
}

export type ClientFetchOptions = ClientRequestOptions

export type ClientFetchManyOptions<T = ClientFetchOptions> = {
    requests: T[]
    
}

export interface Client {
    fetch(options: ClientRequestOptions): Promise<HttpResponse>
    fetchMany(options: ClientFetchManyOptions): Promise<HttpResponse[]>
}