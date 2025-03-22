import { TransformingModel } from "./model"

export class Transformer {
    constructor(readonly data: Record<string, any>) {}

    async transform(transformingModel: TransformingModel) {
        return transformingModel.transform(this.data)
    }
}