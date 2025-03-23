import * as jmespath from "jmespath"

import { ParsingModel } from "./parsing-model-interface"

export type JsonParsingModelShape = {
    [key: string]: string
}

export class JsonParsingModel implements ParsingModel {
    constructor(readonly shape: JsonParsingModelShape) {}

    parse(source: string) {
        const root = JSON.parse(source)
        const data: Record<keyof typeof this.shape, any> = {}

        for (const key in this.shape) {
            const query = this.shape[key]

            data[key] = this.parseValue(query, root)
        }

        return data
    }

    parseValue(query: string, root: any) {
        return jmespath.search(root, query)
    }
}
