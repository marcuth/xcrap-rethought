import * as jmespath from "jmespath"

import { Parser } from "./base-parser"

export class JsonParser extends Parser {
    extract(query: string): any {
        return jmespath.search(this.source, query)
    }
}