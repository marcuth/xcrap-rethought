import htmlParser, { HTMLElement } from "node-html-parser"

import { HTMLElementNotFoundError } from "../errors"
import { ParsingModel } from "../models/interface"
import { ExtractorFunction } from "../extractors"
import { Parser } from "./base-parser"

export type ParseManyOptions = {
    query: string
    extractor: ExtractorFunction
    limit?: number
}

export type ParseFirstOptions = {
    query?: string
    extractor: ExtractorFunction
    default?: string | null
}

export type ExtractFirstOptions = {
    query?: string
    model: ParsingModel
}

export type ExtractManyOptions = {
    query: string
    model: ParsingModel
    limit?: number
}

export class HtmlParser extends Parser {
    readonly root: HTMLElement

    constructor(readonly source: string) {
        super(source)

        this.root = htmlParser.parse(source)
    }

    async parseMany({
        query,
        extractor,
        limit
    }: ParseManyOptions): Promise<(string | undefined)[]> {
        const elements = this.root.querySelectorAll(query)

        let dataList: (string | undefined)[] = []

        for (const element of elements) {
            if (limit != undefined && dataList.length >= limit) break
            const data = await extractor(element)
            dataList.push(data)
        }

        return dataList
    }

    async parseFirst({
        query,
        extractor,
        default: default_
    }: ParseFirstOptions): Promise<string | undefined | null> {
        let data: string | undefined | null

        if (query) {
            const element = this.root.querySelector(query)

            if (!element) {
                throw new HTMLElementNotFoundError(query)
            }

            data = await extractor(element)
        } else {
            data = await extractor(this.root)
        }

        return data ?? default_
    }

    async extractFirst({ model, query }: ExtractFirstOptions) {
        const element = query ? this.root.querySelector(query) : this.root

        if (!element) {
            throw new HTMLElementNotFoundError(query)
        }

        return await model.parse(element.outerHTML)
    }

    async extractMany({ model, query, limit }: ExtractManyOptions) {
        const elements = this.root.querySelectorAll(query)

        let dataList: any[] = []

        for (const element of elements) {
            if (limit != undefined && dataList.length >= limit) break
            const data = await model.parse(element.outerHTML)
            dataList.push(data)
        }

        return dataList
    }
}