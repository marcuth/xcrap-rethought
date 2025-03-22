import { HTMLElement } from "node-html-parser"
import { HTMLElementNotFoundError } from "./errors"

export type ExtractorFunctionReturnType = (string | undefined) | Promise<string | undefined>

export type ExtractorFunction<T = ExtractorFunctionReturnType> = (element: HTMLElement) => T

export type HtmlProperty = 
    | "innerText"
    | "textContent"
    | "text"
    | "innerHTML"
    | "outerHTML"
    | "tagName"
    | "classList"
    | "id"

export type HtmlAttribute =
    | "href"
    | "src"
    | "value"
    | "style"
    | "role"
    | (string & {})

const propertyExtractors: Record<string, (element: HTMLElement) => string | undefined> = {
    innerText: (element) => element.innerText,
    textContent: (element) => element.textContent,
    text: (element) => element.text,
    innerHTML: (element) => element.innerHTML,
    outerHTML: (element) => element.outerHTML,
    tagName: (element) => element.tagName,
    classList: (element) => element.classList.toString(),
    id: (element) => element.id,
}

function extract<T extends HtmlProperty | HtmlAttribute>(
    key: T,
    isAttribute: boolean = false
): ExtractorFunction<string | undefined> {
    return (element: HTMLElement): string | undefined => {
        if (isAttribute) {
            return element.getAttribute(key as string);
        }
        return propertyExtractors[key]?.(element) ?? undefined;
    };
}

const extractInnerText = extract("innerText")
const extractTextContent = extract("textContent")
const extractText = extract("text")
const extractInnerHtml = extract("innerHTML")
const extractOuterHtml = extract("outerHTML")
const extractTagName = extract("tagName")
const extractClassList = extract("classList")
const extractId = extract("id")
const extractHref = extract("href", true)
const extractSrc = extract("src", true)
const extractValue = extract("value", true)
const extractStyle = extract("style", true)
const extractRole = extract("role", true)
const extractAttribute = (name: string) => extract(name, true)

export type FromNextOrPreviousElementSiblingOptions = {
    shouldExists?: boolean
}

const fromNextElementSibling = (
    extractor: ExtractorFunction,
    { shouldExists }: FromNextOrPreviousElementSiblingOptions = { shouldExists: true }
): ExtractorFunction => {
    return (element) => {
        const nextElementSibling = element.nextElementSibling

        if (!nextElementSibling) {
            if (shouldExists) {
                throw new HTMLElementNotFoundError()
            }

            return undefined
        }

        return extractor(nextElementSibling)
    }
}

const fromPreviousElementSibling = (
    extractor: ExtractorFunction,
    { shouldExists }: FromNextOrPreviousElementSiblingOptions = { shouldExists: true }
): ExtractorFunction => {
    return (element) => {
        const previousElementSibling = element.previousElementSibling

        if (!previousElementSibling) {
            if (shouldExists) {
                throw new HTMLElementNotFoundError()
            }

            return undefined
        }

        return extractor(previousElementSibling)
    }
}

export {
    extract,
    extractInnerText,
    extractTextContent,
    extractText,
    extractInnerHtml,
    extractOuterHtml,
    extractAttribute,
    extractHref,
    extractSrc,
    extractValue,
    extractStyle,
    extractRole,
    extractTagName,
    extractClassList,
    extractId,
    fromNextElementSibling,
    fromPreviousElementSibling
}