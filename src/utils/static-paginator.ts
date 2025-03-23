import { InvalidUrlError, PageOutOfRangeError } from "../core/errors"
import { Client, ClientRequestOptions } from "../http"
import { ExtractorFunction } from "../parser"

export type StaticPaginatorOptions = {
    initialPage: number
    lastPage: number
    minPage?: number
    templateUrl: string
}

export type TrackerTransformer = (value: any) => number

export type Tracker = {
    query: string
    extractor: ExtractorFunction
    transformer?: TrackerTransformer
}

export type Trackers = {
    currentPage: Tracker
    lastPage: Tracker
}

export type StaticPaginatorCreateWithTracking = {
    client: Client
    trackers: Trackers
    request: ClientRequestOptions
    templateUrl: string
}

export class StaticPaginator {
    initialPage: number
    lastPage: number
    currentPage: number
    templateUrl: string
    minPage: number

    constructor({
        initialPage,
        lastPage,
        minPage,
        templateUrl,
    }: StaticPaginatorOptions) {
        this.initialPage = initialPage
        this.lastPage = lastPage
        this.currentPage = initialPage
        this.templateUrl = templateUrl
        this.minPage = minPage ?? initialPage
    }

    static async createWithTracking({
        client,
        request,
        templateUrl,
        trackers
    }: StaticPaginatorCreateWithTracking) {
        const response = await client.fetch(request)
        const parser = response.asHtmlParser()
        const currentPageRaw = await parser.parseFirst(trackers.currentPage)
        const currentPageTransformed = (trackers.currentPage.transformer || Number)(currentPageRaw)
        const lastPageRaw = await parser.parseFirst(trackers.lastPage)
        const lastPageTransformed = (trackers.lastPage.transformer || Number)(lastPageRaw)

        return {
            response: response,
            parser: parser,
            paginator: new StaticPaginator({
                initialPage: currentPageTransformed,
                lastPage: lastPageTransformed,
                templateUrl: templateUrl
            })
        }
    }

    static generateUrl(url: string, page: number): string {
        if (!url.includes("{page}")) {
            throw new InvalidUrlError(url)
        }

        return url.replace(/{page}/g, String(page))
    }

    set(page: number): string {
        if (page < this.minPage || page > this.lastPage) {
            throw new PageOutOfRangeError(page, this.minPage, this.lastPage)
        }

        this.currentPage = page

        return this.current
    }

    previous(): string {
        if (this.currentPage <= this.minPage) {
            throw new PageOutOfRangeError(this.currentPage, this.minPage, this.lastPage)
        }

        this.currentPage--

        return this.current
    }

    get current(): string {
        return StaticPaginator.generateUrl(this.templateUrl, this.currentPage)
    }

    next(): string {
        if (this.currentPage >= this.lastPage) {
            throw new PageOutOfRangeError(this.currentPage, this.minPage, this.lastPage)
        }

        this.currentPage++

        return this.current
    }

    dump(limit?: number): string[] {
        const urls: string[] = []

        const maxUrls = limit !== undefined
            ? Math.min(this.lastPage, this.currentPage + limit - 1)
            : this.lastPage

        for (let page = this.currentPage; page <= maxUrls; page++) {
            urls.push(
                StaticPaginator.generateUrl(this.templateUrl, page)
            )
        }

        return urls
    }
}