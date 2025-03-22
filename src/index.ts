import { GotScrapingClient } from "./http/clients/got-scraping"
import { extract, parsingModels } from "./parse"

;(async () => {
    const client = new GotScrapingClient()

    const response = await client.fetch({ url: "https://quotes.toscrape.com/" })
    const parser = response.asHtmlParser()

    const quotesParsingModel = parsingModels.html({
        text: {
            query: ".text",
            extractor: extract("innerText")
        },
        author: {
            query: ".author",
            extractor: extract("innerText")
        },
        tags: {
            query: ".tag",
            extractor: extract("innerText"),
            multiple: true,
            limit: 1
        }
    })

    const rootParsingModel = parsingModels.html({
        quotes: {
            query: ".quote",
            multiple: true,
            model: quotesParsingModel
        }
    })

    const data = await parser.extractFirst({ model: rootParsingModel })

    console.dir(data, { depth: null })
})();