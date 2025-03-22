import { GotScraping, OptionsInit } from "got-scraping"
import { loadEsm } from "load-esm"

import { Client, ClientFetchManyOptions, ClientRequestOptions } from "./interface"
import { HttpClientBase, HttpClientBaseOptions } from "./http-client-base"
import { HttpResponse, FaliedAttempt } from "../response"
import { InvalidStatusCodeError } from "../errors"
import { defaultUserAgent } from "../../constants"
import { delay } from "../../utils/delay"

export type GotScrapingProxy = string

export type GotScrapingRequestOptions = ClientRequestOptions & OptionsInit

export type GotScrapingFetchManyOptions = ClientFetchManyOptions<GotScrapingRequestOptions>

export type GotScrapingClientOptions = HttpClientBaseOptions<GotScrapingProxy> & {
    initOptions?: OptionsInit
}

export class GotScrapingClient extends HttpClientBase<GotScrapingProxy> implements Client {
    protected gotScrapingInstance: GotScraping | undefined

    constructor(readonly options: GotScrapingClientOptions = {}) {
        super(options)
    }

    protected async initGotScraping() {
        const { gotScraping } = await loadEsm("got-scraping")

        this.gotScrapingInstance = gotScraping.extend({
            headers: {
                "User-Agent": this.currentUserAgent ?? defaultUserAgent
            },
            proxyUrl: this.currentProxy,
            ...this.options.initOptions
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
                    method,
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