import puppeteer, { Browser, Page, LaunchOptions } from "puppeteer"

import { Client, ClientFetchManyOptions, ClientRequestOptions } from "./interface"
import { HttpClientBase, HttpClientBaseOptions } from "./http-client-base"
import { defaultPuppeteerActionType } from "../../constants"
import { FaliedAttempt, HttpResponse } from "../response"
import { InvalidStatusCodeError } from "../errors"
import { delay } from "../../utils/delay"

export type PuppeteerProxy = string

export type PuppeteerClientOptions = HttpClientBaseOptions<PuppeteerProxy> & LaunchOptions

export type PuppeteerClientActionFunction = (page: Page) => any | Promise<any>

export enum PuppeteerClientActionType {
    BeforeRequest = "beforeRequest",
    AfterRequest = "afterRequest"
}

export type PuppeteerClientAction = PuppeteerClientActionFunction | {
    exec: PuppeteerClientActionFunction
    type: `${PuppeteerClientActionType}`
}

export type ExtractActionsResult = {
    before: PuppeteerClientActionFunction[]
    after: PuppeteerClientActionFunction[]
}

export type PuppeterRequestOptions = Omit<
    ClientRequestOptions & {
        javaScriptEnabled?: boolean
        actions?: PuppeteerClientAction[]
    }, "method"
>

export type ConfigurePageOptions = {
    javaScriptEnabled: PuppeterRequestOptions["javaScriptEnabled"]
}

export type PuppeteerFetchManyOptions = ClientFetchManyOptions<PuppeterRequestOptions>

export class PuppeteerClient extends HttpClientBase<string> implements Client {
    readonly options: PuppeteerClientOptions
    protected browser?: Browser

    constructor(options: PuppeteerClientOptions = {}) {
        super(options)

        this.options = options
        this.browser = undefined
    }

    protected async initBrowser(): Promise<void> {
        const puppeteerArguments: string[] = []

        if (this.proxy) {
            puppeteerArguments.push(`--proxy-server=${this.currentProxy}`)
        }

        if (this.options.args && this.options.args.length > 0) {
            puppeteerArguments.push(...this.options.args)
        }

        this.browser = await puppeteer.launch({
            ...this.options,
            args: puppeteerArguments,
            headless: this.options.headless ? "shell" : false
        })
    }

    protected async ensureBrowser(): Promise<void> {
        if (!this.browser) {
            await this.initBrowser()
        }
    }

    protected async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close()
            this.browser = undefined
        }
    }

    protected async configurePage(page: Page, { javaScriptEnabled }: ConfigurePageOptions): Promise<void> {
        if (this.currentUserAgent) {
            await page.setUserAgent(this.currentUserAgent)
        }

        if (javaScriptEnabled !== undefined) {
            await page.setJavaScriptEnabled(javaScriptEnabled)
        }
    }

    protected extractActions(actions: PuppeteerClientAction[] | undefined): ExtractActionsResult {
        const actionsBeforeRequest: PuppeteerClientActionFunction[] = []
        const actionsAfterRequest: PuppeteerClientActionFunction[] = []

        if (!actions) {
            actions = []
        }

        for (const action of actions) {
            const actionType = typeof action === "function" ? defaultPuppeteerActionType : action.type
            const actionFunc = typeof action === "function" ? action : action.exec

            if (actionType === "beforeRequest") {
                actionsBeforeRequest.push(actionFunc)
            } else {
                actionsAfterRequest.push(actionFunc)
            }
        }

        return {
            before: actionsBeforeRequest,
            after: actionsAfterRequest
        }
    }

    protected async executeActions(page: Page, actions: PuppeteerClientActionFunction[]): Promise<void> {
        for (const action of actions) {
            await action(page)
        }
    }

    async fetch({
        url,
        javaScriptEnabled,
        maxRetries = 0,
        actions,
        retries = 0,
        retryDelay,
    }: PuppeterRequestOptions): Promise<HttpResponse> {
        await this.ensureBrowser()

        const failedAttempts: FaliedAttempt[] = []

        const attemptRequest = async (currentRetry: number): Promise<HttpResponse> => {
            let page: Page | undefined = undefined

            try {
                const fullUrl = this.currentProxyUrl ? `${this.currentProxyUrl}${url}` : url

                const {
                    before: actionsBeforeRequest,
                    after: actionsAfterRequest
                } = this.extractActions(actions)
        
                page = await this.browser!.newPage()
        
                await this.configurePage(page, { javaScriptEnabled: javaScriptEnabled })
                await this.executeActions(page, actionsBeforeRequest)
                const response = await page.goto(fullUrl)
                await this.executeActions(page, actionsAfterRequest)
                const content = await page.content()
                await page.close()

                const status = response?.status()

                if (status === undefined || !this.isSuccess(status)) {
                    throw new InvalidStatusCodeError(status ?? 500)
                }

                return new HttpResponse({
                    body: content,
                    headers: response?.headers() || {},
                    status: response?.status() || 200,
                    statusText: response?.statusText() || "Ok",
                    attempts: currentRetry + 1,
                    failedAttempts: failedAttempts,
                })
            } catch (error: any) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error"

                failedAttempts.push({ error: errorMessage, timestamp: new Date() })
    
                if (page) {
                    await page.close().catch(() => {})
                }
    
                if (currentRetry < maxRetries) {
                    if (retryDelay !== undefined && retryDelay > 0) {
                        await delay(retryDelay)
                    }

                    return await attemptRequest(currentRetry + 1)
                }
    
                return new HttpResponse({
                    body: errorMessage,
                    headers: {},
                    status: error.status || 500,
                    statusText: "Request Failed",
                    attempts: currentRetry + 1,
                    failedAttempts: failedAttempts,
                })
            }
        }

        return await attemptRequest(retries)
    }

    async fetchMany({ requests, concurrency, requestDelay }: PuppeteerFetchManyOptions): Promise<HttpResponse[]> {
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

    async close(): Promise<void> {
        if (this.browser) {
            await this.closeBrowser()
        }
    }
}