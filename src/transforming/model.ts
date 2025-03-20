import { TransformerMiddlewareFunction, NextFunction } from "./middlewares"

export type TransformingModelShape = {
    [key: string]: TransformerMiddlewareFunction[]
}

export class TransformingModel {
    constructor(readonly shape: TransformingModelShape) {}

    async transform(data: Record<string, any>): Promise<Record<string, any>> {
        const result: Record<string, any> = {...data}

        for (const key in this.shape) {
            const middlewares = this.shape[key]
            let transformedValue = data[key]

            const defaultNext: NextFunction = async (partialData) => partialData

            const chain = middlewares.reduceRight(
                (next: NextFunction, middleware: TransformerMiddlewareFunction) => {
                    return async (currentData: Partial<Record<string, any>>) => {
                        const mergedData = {
                            ...result,
                            [key]: transformedValue,
                            ...currentData,
                        }

                        const middlewareResult = await middleware(mergedData, next)
                        transformedValue = middlewareResult[key] ?? transformedValue

                        return middlewareResult
                    }
                },
                defaultNext
            )

            const middlewareResult = await chain({ [key]: transformedValue })
            
            Object.assign(result, middlewareResult)
        }

        return result
    }
}