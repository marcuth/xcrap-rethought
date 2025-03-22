import fakeUa from "fake-useragent"

import { GotScrapingClient } from "./http/clients/got-scraping"
import { extractInnerText, HtmlParsingModel } from "./parsing"
import { PuppeteerClient } from "./http"

;(async () => {
    const client = new GotScrapingClient()

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

// (async () => {
//     // Importação dinâmica do módulo got-scraping
//     const { gotScraping } = await loadEsm('got-scraping');
//     // Agora você pode utilizar o gotScraping normalmente.
//     console.log(gotScraping)
//   })()