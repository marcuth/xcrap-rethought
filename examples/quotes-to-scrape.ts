import { transform } from "../src/transformer"
import { HtmlParsingModel, extract } from "../src/parser"
import { AxiosClient } from "../src/http"

const tagParsingModel = new HtmlParsingModel({
    name: {
        query: ".tag",
        extractor: extract("innerText")
    },
    pageUrl: {
        query: ".tag",
        extractor: extract("href", true)
    }
})

const quoteParsingModel = new HtmlParsingModel({
    text: {
        query: ".text",
        extractor: extract("innerText")
    },
    authorName: {
        query: ".author",
        extractor: extract("innerText")
    },
    authorPageUrl: {
        query: "a",
        extractor: extract("href", true)
    },
    tags: {
        query: ".tags",
        multiple: true,
        model: tagParsingModel
    }
})

const rootParsingModel = new HtmlParsingModel({
    quotes: {
        query: ".quote",
        multiple: true,
        model: quoteParsingModel
    }
})

async function start() {
    const url = "https://quotes.toscrape.com/"
    const client = new AxiosClient()
    const response = await client.fetch({ url: url })
    const parser = response.asHtmlParser()
    const data = await parser.extractFirst({ model: rootParsingModel })

    console.dir(data, { depth: null })
}

start()