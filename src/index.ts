import { AxiosClient } from "./clients/axios-client";
import { extractAttribute, extractHref, extractInnerText } from "./parsing/extractors"
import { HtmlParsingModel } from "./parsing/models/html"
import { HtmlParser } from "./parsing/parsers/html"

;import { copyFieldValue, resolveRelativePath, stringLength, stringToUpperCase, trimString } from "./transforming/middlewares"
import { TransformingModel } from "./transforming/model"
import { Transformer } from "./transforming/transformer"

(async () => {
    const client = new AxiosClient()

    const response = await client.fetch({ url: "https://deetlist.com/dragoncity/events/race/" })

    const parser = response.toHtml()

    // const parser = await HtmlParser.loadFile("examples/deetlist-heroic-races.html")
    
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
        },
        ogUrl: {
            query: "meta[property='og:url']",
            default: null,
            extractor: extractInnerText
        },
        charset: {
            query: "meta[charset]",
            default: null,
            extractor: extractAttribute("charset")
        },
        viewport: {
            query: "meta[name='viewport']",
            default: null,
            extractor: extractInnerText
        },
        author: {
            query: "meta[name='author']",
            default: null,
            extractor: extractInnerText
        },
        ogType: {
            query: "meta[property='og:type']",
            default: null,
            extractor: extractInnerText
        },
        twitterCard: {
            query: "meta[name='twitter:card']",
            default: null,
            extractor: extractInnerText
        },
        twitterTitle: {
            query: "meta[name='twitter:title']",
            default: null,
            extractor: extractInnerText
        },
        twitterDescription: {
            query: "meta[name='twitter:description']",
            default: null,
            extractor: extractInnerText
        },
        twitterImage: {
            query: "meta[name='twitter:image']",
            default: null,
            extractor: extractInnerText
        },
        favicon: {
            query: "link[rel='icon'], link[rel='shortcut icon']",
            default: null,
            extractor: extractHref
        }
    })

    const metadata = await parser.parseModel(metadataParsingModel)

    const metadataTransformingModel = new TransformingModel({
        title: [
            trimString("title"),
            stringToUpperCase("title")
        ],
        test: [
            copyFieldValue("title", "test"),
            stringLength("test")
        ],
        favicon: [
            resolveRelativePath("favicon", "https://deetlist.com/")
        ]
    })

    const transformer = new Transformer(metadata)

    const transformedMetadata = await transformer.transform(metadataTransformingModel)

    console.log(metadata)

    console.log(transformedMetadata)
})();