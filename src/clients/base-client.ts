import { defaultUserAgent } from "../constants"
import { HttpResponse } from "./response"

export type ProxyUrlFuction = () => string
export type ProxyFunction<ProxyReturn = any> = () => ProxyReturn
export type UserAgentFunction = () => string

export type BaseClientOptions<Proxy> = {
    proxyUrl?: string | ProxyUrlFuction
    proxy?: Proxy | ProxyFunction<Proxy>
    userAgent?: string | UserAgentFunction
}

class BaseClient<Proxy> {
    public readonly proxy?: Proxy | ProxyFunction<Proxy>
    public readonly userAgent?: string | UserAgentFunction
    public readonly proxyUrl?: string | ProxyUrlFuction

    public constructor({
        proxy,
        userAgent,
        proxyUrl
    }: BaseClientOptions<Proxy>) {
        this.proxy = proxy
        this.userAgent = userAgent ?? defaultUserAgent
        this.proxyUrl = proxyUrl
    }

    protected get currentProxyUrl(): string | undefined {
        const currentProxyUrl = typeof this.proxyUrl === "function" ?
            this.proxyUrl() :
            this.proxyUrl

        return currentProxyUrl
    }

    protected get currentUserAgent(): string | undefined {
        const currentUserAgent = typeof this.userAgent === "function" ?
            this.userAgent() :
            this.userAgent

        return currentUserAgent
    }

    protected createTaskChunks(tasks: (() => Promise<any>)[], concurrency: number): (() => Promise<HttpResponse>)[][] {
        const taskChunks: (() => Promise<HttpResponse>)[][] = []
        const tasksLength = tasks.length

        for (let i = 0; i < tasksLength; i += concurrency) {
            taskChunks.push(tasks.slice(i, i + concurrency))
        }

        return taskChunks
    }

    protected get currentProxy(): any | undefined {
        const currentProxy = typeof this.proxy === "function" ?
            (this.proxy as ProxyFunction)() :
            this.proxy

        return currentProxy
    }
}

export default BaseClient