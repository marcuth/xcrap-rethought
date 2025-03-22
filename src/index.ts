import fakeUa from "fake-useragent"
import { PuppeteerClient } from "./http/clients/puppeteer"
import { extractInnerText, HtmlParsingModel, JsonParsingModel } from "./parsing"
import { TransformingModel } from "./transforming"
import { AxiosClient } from "./http"

;(async () => {
    const client = new PuppeteerClient({ userAgent: fakeUa, headless: true })

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

    await client.close()

    console.dir(data, { depth: null })
})();