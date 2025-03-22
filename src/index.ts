import fakeUa from "fake-useragent"

import { extractInnerText, HtmlParsingModel } from "./parsing"
import { PuppeteerClient } from "./http"

;(async () => {
    const client = new PuppeteerClient({
        userAgent: fakeUa,
        headless: true,
        proxyUrl: "https://proxy.marcuth.workers.dev/"
    })

    const response = await client.fetch({ url: "https://quotes.toscrape.com/", javaScriptEnabled: false })
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

    await client.close()

    console.dir(data, { depth: null })
})();