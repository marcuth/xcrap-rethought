import { HtmlParsingModel, HtmlParsingModelShape } from "./html-parsing-model"
import { JsonParsingModel, JsonParsingModelShape } from "./json-parsing-model"

export * from "./extractors"
export * from "./html-parsing-model"
export * from "./json-parsing-model"
export * from "./parsing-model-interface" 
export * from "./base-parser"
export * from "./html-parser"
export * from "./json-parser"

export const parsingModels = {
    html: (shape: HtmlParsingModelShape) => new HtmlParsingModel(shape),
    json: (shape: JsonParsingModelShape) => new JsonParsingModel(shape)
}