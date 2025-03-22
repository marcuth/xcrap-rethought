import { HtmlParsingModel, HtmlParsingModelShape } from "./html"
import { JsonParsingModel, JsonParsingModelShape } from "./json"

export * from "./html"
export * from "./interface"
export * from "./json"

export const parsingModels = {
    html: (shape: HtmlParsingModelShape) => new HtmlParsingModel(shape),
    json: (shape: JsonParsingModelShape) => new JsonParsingModel(shape)
}