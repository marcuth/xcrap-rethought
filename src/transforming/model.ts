import { MiddlewarePipeline } from "./middleware-pipeline";
import { TransformerMiddlewareFunction, NextFunction } from "./middlewares"

export type TransformingModelShape = {
    [key: string]: TransformerMiddlewareFunction[]
}

export class TransformingModel {
    constructor(readonly shape: TransformingModelShape) {}

    async transform(data: Record<string, any>): Promise<Record<string, any>> {
        const result: Record<string, any> = {...data}

        await Promise.all(Object.keys(this.shape).map(async (key) => {
            const pipeline = new MiddlewarePipeline(this.shape[key])
            const transformedData = await pipeline.execute(data, key, data[key])
            Object.assign(result, transformedData)
        }))

        return result
    }
}