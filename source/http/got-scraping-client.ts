import { HeaderGeneratorOptions } from "header-generator"
import { GotScraping } from "got-scraping"
import { loadEsm } from "load-esm"

import { Client, ClientFetchManyOptions, ClientRequestOptions } from "./client-interface"
import { BaseClient, BaseClientOptions } from "./base-client"
import { HttpResponse, FaliedAttempt } from "./response"
import { InvalidStatusCodeError } from "../core/errors"
import { defaultUserAgent } from "../core/constants"
import { delay } from "../utils/delay"

export type GotSrapingInitOptions = {
    headerGeneratorOptions?: HeaderGeneratorOptions
    headers?: Record<string, any>
    responseType?: "json" | "html"
    http2?: boolean
    https?: {
        rejectUnauthorized: boolean
        ciphers: string
    },
    throwHttpErrors?: boolean
    useHeaderGenerator?: string
    timeout?: number
    retry?: {
        retries: number
        maxRetryAfter: number
    }
}

export type GotScrapingProxy = string

export type GotScrapingRequestOptions = ClientRequestOptions & GotSrapingInitOptions

export type GotScrapingFetchManyOptions = ClientFetchManyOptions<GotScrapingRequestOptions>

export type GotScrapingClientOptions = BaseClientOptions<GotScrapingProxy> & {
    initOptions?: GotSrapingInitOptions
}

export class GotScrapingClient extends BaseClient<GotScrapingProxy> implements Client {
    protected gotScrapingInstance: GotScraping | undefined

    constructor(readonly options: GotScrapingClientOptions = {}) {
        super(options)
    }

    protected async initGotScraping() {
        const module = await loadEsm("got-scraping")
        const gotScraping: GotScraping = module.gotScraping

        this.gotScrapingInstance = gotScraping.extend({
            headers: {
                "User-Agent": this.currentUserAgent ?? defaultUserAgent
            },
            proxyUrl: this.currentProxy,
            ...this.options.initOptions,
        })
    }

    protected async ensureGotScraping(): Promise<void> {
        if (!this.gotScrapingInstance) {
            await this.initGotScraping()
        }
    }

    async fetch({
        url,
        maxRetries = 0,
        retries = 0,
        retryDelay,
        method = "GET",
        ...gotOptions
    }: GotScrapingRequestOptions): Promise<HttpResponse> {
        await this.ensureGotScraping()

        const failedAttempts: FaliedAttempt[] = []

        const attemptRequest = async (currentRetry: number): Promise<HttpResponse> => {
            try {
                const fullUrl = this.currentProxyUrl ? `${this.currentProxyUrl}${url}` : url

                const response = await this.gotScrapingInstance!({
                    url: fullUrl,
                    method: method,
                    headers: {
                        "User-Agent": this.currentUserAgent ?? defaultUserAgent,
                        ...gotOptions.headers
                    },
                    proxyUrl: this.currentProxy,
                    ...gotOptions
                })

                if (!this.isSuccess(response.statusCode)) {
                    throw new InvalidStatusCodeError(response.statusCode)
                }

                return new HttpResponse({
                    status: response.statusCode,
                    statusText: response.statusMessage || "OK",
                    headers: response.headers,
                    body: response.body,
                    attempts: currentRetry + 1,
                    failedAttempts,
                })
            } catch (error: any) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error"
                failedAttempts.push({ error: errorMessage, timestamp: new Date() })

                if (error.response && currentRetry < maxRetries) {
                    if (retryDelay !== undefined && retryDelay > 0) {
                        await delay(retryDelay)
                    }
                    return await attemptRequest(currentRetry + 1)
                }

                return new HttpResponse({
                    status: error.response?.statusCode || 500,
                    statusText: error.response?.statusMessage || "Request Failed",
                    body: error.response?.body || errorMessage,
                    headers: error.response?.headers || {},
                    attempts: currentRetry + 1,
                    failedAttempts,
                })
            }
        }

        return await attemptRequest(retries)
    }

    async fetchMany({ requests, concurrency, requestDelay }: GotScrapingFetchManyOptions): Promise<HttpResponse[]> {
        const results: HttpResponse[] = []
        const executing: Promise<void>[] = []

        for (let i = 0; i < requests.length; i++) {
            const promise = this.executeRequest({
                request: requests[i],
                index: i,
                requestDelay: requestDelay,
                results: results
            }).then(() => undefined)

            executing.push(promise)

            if (this.shouldThrottle(executing, concurrency)) {
                await this.handleConcurrency(executing)
            }
        }

        await Promise.all(executing)

        return results
    }
}