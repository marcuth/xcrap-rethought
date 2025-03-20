import { JsonParsingModel } from "./models/json"
import { HtmlParsingModel } from "./models/html"
import { extractInnerText } from "./extractors"
import { HtmlParser } from "./parsers/html"

const userParsingModel = new HtmlParsingModel({
    name: {
        query: "p[id='name']",
        extractor: extractInnerText
    },
    age: {
        query: "p#age",
        extractor: extractInnerText
    }
})

const dataParsingModel = new JsonParsingModel({
    users: "users[*]"
})

const rootParsingModel = new HtmlParsingModel({
    title: {
        query: "title",
        extractor: extractInnerText
    },
    users: {
        query: "body",
        isGroup: true,
        model: userParsingModel
    },
    data: {
        query: "script#json-data",
        extractor: extractInnerText,
        model: dataParsingModel
    }
})

;(async () => {
    const source = "<html><head><title>Test</title></head><body><p id='name'>User</p><p id='age'>12</p><script id='json-data' type='application/json'>{\"meta\": { \"version\": \"1.0\" }}</script></body></html>"

    const parser = new HtmlParser(source)

    const data = await parser.parseModel(rootParsingModel)

    console.log(data)
})();