import { defaultUserAgent } from "../../constants"

export type ProxyUrlFuction = () => string
export type ProxyFunction<ProxyReturn = any> = () => ProxyReturn
export type UserAgentFunction = () => string

export type BaseClientOptions<Proxy> = {
    proxyUrl?: string | ProxyUrlFuction
    proxy?: Proxy | ProxyFunction<Proxy>
    userAgent?: string | UserAgentFunction
}

export class BaseClient<Proxy> {
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

    protected shouldThrottle(
        executing: Promise<void>[],
        concurrency?: number
    ): boolean {
        return concurrency !== undefined && executing.length >= concurrency
    }

    protected cleanCompletedPromises(executing: Promise<void>[]): void {
        for (let i = executing.length - 1; i >= 0; i--) {
            executing[i].then(() => executing.splice(i, 1)).catch(() => executing.splice(i, 1))
        }
    }

    protected async handleConcurrency(executing: Promise<void>[]): Promise<void> {
        await Promise.race(executing)
        this.cleanCompletedPromises(executing)
    }

    protected get currentProxy(): any | undefined {
        const currentProxy = typeof this.proxy === "function" ?
            (this.proxy as ProxyFunction)() :
            this.proxy

        return currentProxy
    }
}