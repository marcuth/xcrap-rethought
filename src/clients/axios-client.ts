import axios, { AxiosInstance, AxiosRequestConfig } from "axios"

import { Client, ClientFetchManyOptions, ClientRequestOptions } from "./interface"
import { FalidAttempt, HttpResponse } from "./response"
import { delay } from "../utils/delay"

export type AxiosRequestOptions = ClientRequestOptions & AxiosRequestConfig<any>

export type AxiosFetchManyOptions = ClientFetchManyOptions<AxiosRequestOptions>

export class AxiosClient implements Client {
    protected readonly axiosInstance: AxiosInstance

    constructor() {
        this.axiosInstance = axios.create()
    }

    isSuccess(statusCode: number): boolean {
        return statusCode >= 200 && statusCode < 300
    }

    async fetch({
        maxRetries = 0,
        retries = 0,
        retryDelay,
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

    async fetchMany(): Promise<HttpResponse[]> {
        
    }
}