import { extractHref, HtmlParsingModel, JsonParsingModel } from "./parsing"
import { TransformingModel } from "./transforming"

;(async () => {
    const parsingModel = new HtmlParsingModel({
        links: {
            query: "a",
            extractor: extractHref,
            isGroup: true
        }
    })
    
    const value = await parsingModel.parse("<a href='https://google.com'>test</a>")

    console.log(value)
})();