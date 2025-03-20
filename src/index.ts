import { extractInnerText } from "./parsing/extractors"
import { HtmlParsingModel } from "./parsing/models/html";
import { HtmlParser } from "./parsing/parsers/html"

;(async () => {
    const parser = await HtmlParser.loadFile("examples/deetlist-heroic-races.html")
    
    const metadataParsingModel = new HtmlParsingModel({
        title: {
            query: "title",
            default: null,
            extractor: extractInnerText
        },
        description: {
            query: "meta[name='description']",
            default: null,
            extractor: extractInnerText
        },
        keywords: {
            query: "meta[name='keywords']",
            default: null,
            extractor: extractInnerText
        },
        ogTitle: {
            query: "meta[property='og:title']",
            default: null,
            extractor: extractInnerText
        },
        ogDescription: {
            query: "meta[property='og:description']",
            default: null,
            extractor: extractInnerText
        },
        ogImage: {
            query: "meta[property='og:image']",
            default: null,
            extractor: extractInnerText
        }
    })

    const metadata = await parser.parseModel(metadataParsingModel)

    console.log(metadata)
})();