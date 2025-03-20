import htmlParser, { HTMLElement } from "node-html-parser"

import { HTMLElementNotFoundError } from "../errors"
import { ParsingModel } from "./interface"

export type HtmlParsingModelResultData<T> = {
    [K in keyof T]: T[K] extends { isGroup: true }
        ? T[K] extends { model: infer NestedModel }
            ? NestedModel extends ParsingModel
                ? Awaited<ReturnType<NestedModel["parse"]>>[]
                : never
            : string[]
        : T[K] extends { model: infer NestedModel }
        ? NestedModel extends ParsingModel
            ? Awaited<ReturnType<NestedModel["parse"]>>
            : never
        : string;
}
export type ExtractorFunction = (element: HTMLElement) => string | Promise<string>

export type HtmlParsingModelBaseValue = {
    query?: string
    isGroup?: boolean
    extractor: ExtractorFunction
}

export type HtmlParsingModelNestedValue = {
    query: string
    model: ParsingModel
    isGroup?: boolean
    extractor?: ExtractorFunction
}

export type HtmlParsingModelValue = HtmlParsingModelBaseValue | HtmlParsingModelNestedValue

export type HtmlParsingModelShape = {
    [key: string]: HtmlParsingModelValue
}

export class HtmlParsingModel implements ParsingModel {
    constructor(readonly shape: HtmlParsingModelShape) {}

    async parse(source: string): Promise<any> {
        const root = htmlParser.parse(source)
        const data: Record<keyof typeof this.shape, any> = {}

        for (const key in this.shape) {
            const value = this.shape[key]

            const isNestedValue = "model" in value

            if (isNestedValue) {
                data[key] = await this.parseNestedValue(value, root)
            } else {
                data[key] = await this.parseBaseValue(value, root)
            }
        }
        
        return data
    }

    protected async parseBaseValue(value: HtmlParsingModelBaseValue, root: HTMLElement): Promise<string[] | string> {
        if (value.isGroup) {
            if (!value.query) {
                throw new Error("Group value must have a 'query'")
            }

            const elements = root.querySelectorAll(value.query)

            return await Promise.all(
                elements.map(element => value.extractor(element))
            )
        } else {
            const element = value.query ? root.querySelector(value.query) : root

            if (!element) {
                throw new HTMLElementNotFoundError(value.query)
            }

            return value.extractor(element)
        }
    }

    protected async parseNestedValue(value: HtmlParsingModelNestedValue, root: HTMLElement) {
        if (value.isGroup) {
            const elements = root.querySelectorAll(value.query)

            return await Promise.all(
                elements.map(element => value.model.parse(element.outerHTML))
            )
        } else {
            const element = root.querySelector(value.query)

            if (!element) {
                throw new HTMLElementNotFoundError(value.query)
            }

            const source = value.extractor ? await value.extractor(element) : element.outerHTML

            const data = await value.model.parse(source)

            return data
        }
    }
}