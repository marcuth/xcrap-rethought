import { extract, HtmlParser, parsingModelFactory } from "../src/parser"

describe("HtmlParser integration test", () => {
    test("should extract title from HTML", async () => {
        const html = "<html><head><title>Example</title></head></html>"
        const parser = new HtmlParser(html)

        const rootParsingModel = parsingModelFactory.html({
            title: {
                query: "title",
                extractor: extract("innerText")
            }
        })

        const data = await parser.extractFirst({ model: rootParsingModel })

        expect(data).toEqual({ title: "Example" })
    })

    test("should extract multiple items from HTML", async () => {
        const html = `<html><head><title>Example</title></head><body><h1>Itens</h1><ul><li>Item A</li><li>Item B</li><li>Item C</li><li>Item D</li></ul></body></html>`
        const parser = new HtmlParser(html)

        const rootParsingModel = parsingModelFactory.html({
            items: {
                query: "li",
                multiple: true,
                extractor: extract("innerText")
            }
        })

        const data = await parser.extractFirst({ query: "ul", model: rootParsingModel })

        expect(data).toEqual({
            items: [
                "Item A",
                "Item B",
                "Item C",
                "Item D"
            ]
        })
    })
})
