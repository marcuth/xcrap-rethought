import { HTMLElement } from "node-html-parser"
import * as htmlParser from "node-html-parser"
import { extractAttribute, extractInnerHtml, extractInnerText, extractOuterHtml } from "./extractors"



export type HtmlParserResultData<T> = {
    [K in keyof T]: T[K] extends { isGroup: true }
        ? string[]
        : T[K] extends { model: infer NestedHtmlParsingModel }
        ? T[K] extends { isGroup: true }
            ? HtmlParserResultData<NestedHtmlParsingModel>[]
            : HtmlParserResultData<NestedHtmlParsingModel>
        : string
}

export type ExtractorFunction = (element: HTMLElement) => string | Promise<string>

export type HtmlParsingModelBaseValue = {
    query?: string
    isGroup?: boolean
    extractor: ExtractorFunction
}

export type HtmlParsingModelNestedValue = {
    query: string
    model: HtmlParsingModel
    isGroup?: boolean
}

export type HtmlParsingModelValue = HtmlParsingModelBaseValue | HtmlParsingModelNestedValue

export type HtmlParsingModelShape = {
    [key: string]: HtmlParsingModelValue
}

export type ParseItemGroupOptions<HtmlParsingModelType> = {
    query: string
    model: HtmlParsingModelType
    limit?: number
}

export type ParseItemOptions<HtmlParsingModelType> = {
    query?: string
    model: HtmlParsingModelType
}

export class NotFoundHTMLElement extends Error {
    constructor(query?: string) {
        super(`Element with query "${query || 'no query provided'}" not found`)
    }
}

export class HtmlParsingModel {
    constructor(readonly shape: HtmlParsingModelShape) {}

    async parse(source: string): Promise<any> {
        const root = htmlParser.parse(source)

        for (const key in this.shape) {
            const value = this.shape[key]

            if ("extractor" in value) {
                const baseValue = value as HtmlParsingModelBaseValue
                const element = baseValue.query ? root.querySelector(baseValue.query) : root

                if (!element) {
                    throw new NotFoundHTMLElement(baseValue.query)
                }

                const result: string = await value.extractor(element)

                return result
            } else {
                const element = root.querySelector(value.query)

                if (!element) {
                    throw new NotFoundHTMLElement(value.query)
                }

                const result: HtmlParserResultData<any> = await value.model.parse(element.innerHTML)

                return result
            }
        }
    }
}

const parsingModel = new HtmlParsingModel({
    title: {
        query: "title",
        extractor: extractInnerText
    }
})

parsingModel.parse("<html><head><title>Test</title></head></html>").then(console.log)