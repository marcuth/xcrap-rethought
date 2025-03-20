import axios, { AxiosInstance, AxiosInterceptorManager, AxiosProxyConfig, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { RateLimitedAxiosInstance, rateLimitOptions } from "axios-rate-limit"
const axiosRateLimit = require("axios-rate-limit")

import { Client, ClientFetchManyOptions, ClientRequestOptions } from "./interface"
import { FalidAttempt, HttpResponse } from "./response"
import { delay } from "../utils/delay"
import BaseClient, { BaseClientOptions } from "./base-client"
import { defaultUserAgent } from "../constants"

export type AxiosRequestOptions = ClientRequestOptions & AxiosRequestConfig<any>

export type AxiosInterceptors = {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
}

export type AxiosFetchManyOptions = ClientFetchManyOptions<AxiosRequestOptions>

export type AxiosClientOptions = BaseClientOptions<AxiosProxyConfig> & {
    withCredentials?: boolean
    rateLimit?: rateLimitOptions
}

export class AxiosClient extends BaseClient<AxiosProxyConfig> implements Client {
    protected readonly axiosInstance: AxiosInstance
    protected readonly rateLimitedInstance: RateLimitedAxiosInstance
    readonly interceptors: AxiosInterceptors 

    constructor(options: AxiosClientOptions = {}) {
        super(options)

        this.axiosInstance = axios.create({
            proxy: this.currentProxy,
            headers: {
                "User-Agent": this.currentUserAgent ?? defaultUserAgent
            },
            ...(options.withCredentials && { withCredentials: options.withCredentials })
        })

        this.rateLimitedInstance = axiosRateLimit(
            this.axiosInstance as AxiosInstance,
            options.rateLimit ?? {}
        )

        this.rateLimitedInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            config.proxy = this.currentProxy

            if (config.headers) {
                config.headers["User-Agent"] = this.currentUserAgent ?? defaultUserAgent
            } else {
                (config as AxiosRequestConfig).headers = { "User-Agent": this.currentUserAgent }
            }

            return config
        })

        this.interceptors = this.rateLimitedInstance.interceptors
    }

    isSuccess(statusCode: number): boolean {
        return statusCode >= 200 && statusCode < 300
    }

    async fetch({
        maxRetries = 0,
        retries = 0,
        retryDelay,
        method = "GET",
        ...axiosOptions
    }: AxiosRequestOptions): Promise<HttpResponse> {
        const failedAttempts: FalidAttempt[] = []

        const attemptRequest = async (currentRetry: number): Promise<HttpResponse> => {
            try {
                const response = await this.axiosInstance.request(axiosOptions)

                return new HttpResponse({
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    body: response.data,
                    attempts: currentRetry + 1,
                    failedAttempts,
                })
            } catch(error: any) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error"
                failedAttempts.push({ error: errorMessage, timestamp: new Date() })

                if (axios.isAxiosError(error) && currentRetry < maxRetries) {
                    if (retryDelay !== undefined && retryDelay > 0) {
                        await delay(retryDelay)
                    }

                    return await attemptRequest(currentRetry + 1)
                }

                return new HttpResponse({
                    status: error.response?.status || 500,
                    statusText: error.response?.statusText || "Request Failed",
                    body: error.response?.data || errorMessage,
                    headers: error.response?.headers || {},
                    attempts: currentRetry + 1,
                    failedAttempts,
                })
            }
        }

        return await attemptRequest(retries)
    }

    async fetchMany({ requests, concurrency, requestDelay }: AxiosFetchManyOptions): Promise<HttpResponse[]> {
        const results: HttpResponse[] = []
        const executing: Promise<void>[] = []


        const executeRequest = async (request: AxiosRequestOptions, index: number) => {
            if (requestDelay !== undefined && requestDelay > 0 && index > 0) {
                await delay(requestDelay)
            }
            const response = await this.fetch(request)
            results[index] = response
        }

        for (let i = 0; i < requests.length; i++) {
            const promise = executeRequest(requests[i], i).then(() => undefined)

            executing.push(promise)

            if (concurrency !== undefined && executing.length >= concurrency) {
                await Promise.race(executing)

                for (let j = executing.length - 1; j >= 0; j--) {
                    if (await Promise.resolve(executing[j]).then(() => true).catch(() => true)) {
                        executing.splice(j, 1)
                    }
                }
            }
        }

        await Promise.all(executing)

        return results
    }
}