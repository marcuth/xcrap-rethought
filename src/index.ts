import fakeUa from "fake-useragent"

import { extractInnerText, HtmlParsingModel, JsonParsingModel } from "./parsing"
import { TransformingModel } from "./transforming"
import { AxiosClient } from "./http"

;(async () => {
    const client = new AxiosClient({ userAgent: fakeUa })

    const response = await client.fetch({ url: "https://quotes.toscrape.com/" })
    const parser = response.asHtmlParser()

    const quotesParsingModel = new HtmlParsingModel({
        text: { query: ".text", extractor: extractInnerText },
        author: { query: ".author", extractor: extractInnerText },
        tags: { query: ".tag", extractor: extractInnerText, isGroup: true }
    })

    const rootParsingModel = new HtmlParsingModel({
        quotes: {
            query: ".quote",
            isGroup: true,
            model: quotesParsingModel
        }
    })

    const data = await parser.extractFirst({ model: rootParsingModel })

    console.dir(data, { depth: null })
})();