import htmlParser, { HTMLElement } from "node-html-parser"

import { ExtractorFunction } from "../models/html"
import { ParsingModel } from "../models/interface"
import { HTMLElementNotFoundError } from "../errors"
import { Parser } from "./base"

export type ParseManyOptions = {
    query: string
    extractor: ExtractorFunction
    limit?: number
}

export type ParseFirstOptions = {
    query?: string
    extractor: ExtractorFunction
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
    }: ParseManyOptions): Promise<string[]> {
        const elements = this.root.querySelectorAll(query)

        let dataList: string[] = []

        for (const element of elements) {
            if (limit != undefined && dataList.length >= limit) break
            const data = await extractor(element)
            dataList.push(data)
        }

        return dataList
    }

    async parseFirst({
        query,
        extractor
    }: ParseFirstOptions): Promise<string> {
        let data: string

        if (query) {
            const element = this.root.querySelector(query)

            if (!element) {
                throw new HTMLElementNotFoundError(query)
            }

            data = await extractor(element)
        } else {
            data = await extractor(this.root)
        }

        return data
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