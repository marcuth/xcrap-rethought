import { HTMLElement } from "node-html-parser"

export type ExtractorFunctionReturnType = (string | undefined) | Promise<string | undefined>

export type ExtractorFunction<T = ExtractorFunctionReturnType> = (element: HTMLElement) => T

function extractInnerText(element: HTMLElement): string {
    const text = element.innerText
    return text
}

function extractTextContent(element: HTMLElement): string {
    const text = element.textContent
    return text
}

function extractText(element: HTMLElement): string {
    const text = element.text
    return text
}

function extractInnerHtml(element: HTMLElement): string {
    const html = element.innerHTML
    return html
}

const extractAttribute = (name: string) => {
    return (element: HTMLElement): string | undefined => {
        const attribute = element.attrs[name]
        return attribute
    }
}

const extractValue = (element: HTMLElement): string | undefined => {
    const value = element.getAttribute("value")
    return value
}

function extractOuterHtml(element: HTMLElement): string {
    return element.outerHTML
}

function extractTagName(element: HTMLElement): string {
    return element.tagName
}

function extractClassList(element: HTMLElement): string {
    return element.classList.toString()
}

function extractId(element: HTMLElement): string {
    return element.id
}

function extractStyle(element: HTMLElement): string | undefined {
    return element.getAttribute("style")
}

function extractRole(element: HTMLElement): string | undefined {
    return element.getAttribute("role")
}

const extractHref = extractAttribute("href")

const extractSrc = extractAttribute("src")

export {
    extractInnerText,
    extractTextContent,
    extractText,
    extractInnerHtml,
    extractAttribute,
    extractValue,
    extractOuterHtml,
    extractTagName,
    extractClassList,
    extractId,
    extractStyle,
    extractRole,
    extractHref,
    extractSrc
}