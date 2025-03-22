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
})
