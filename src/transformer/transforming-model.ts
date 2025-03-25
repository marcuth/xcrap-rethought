export type TransformerFunction = (data: Record<string, any>) =>  any | Promise<any>

export type TransformingModelShape = {
    [key: string]: TransformerFunction[]
}

export class TransformingModel {
    constructor(readonly shape: TransformingModelShape) {}

    async transform(data: Record<string, any>): Promise<Record<string, any>> {
        const result: Record<string, any> = {...data}

        for (const key in this.shape) {
            const transformers = this.shape[key]

            for (const transformer of transformers) {
                result[key] = await transformer(result)
            }
        }

        return result
    }
}