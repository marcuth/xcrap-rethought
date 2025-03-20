import { ParsingModel } from "../models/interface"

export class Parser {
    constructor(readonly source: string) {}

    async parseModel(parsingModel: ParsingModel) {
        return await parsingModel.parse(this.source)
    }
}