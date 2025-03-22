import * as jmespath from "jmespath"

import { ParsingModel } from "./interface"

export type JsonParsingModelShape = {
    [key: string]: string
}

export class JsonParsingModel implements ParsingModel {
    constructor(readonly shape: JsonParsingModelShape) {}

    parse(source: string): Promise<any> {
        const root = JSON.parse(source)
        const data: Record<keyof typeof this.shape, any> = {}

        for (const key in this.shape) {
            const value = this.shape[key]

            data[key] = this.parseValue(value, root)
        }

        return root
    }

    parseValue(value: string, root: any) {
        return jmespath.search(root, value)
    }
}
