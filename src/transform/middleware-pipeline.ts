import { NextFunction, TransformerMiddlewareFunction } from "./middlewares"

export class MiddlewarePipeline {
    constructor(private middlewares: TransformerMiddlewareFunction[]) {}

    async execute(data: Record<string, any>, key: string, value: any): Promise<any> {
        let transformedValue = value

        const chain = this.middlewares.reduceRight(
            (next: NextFunction, middleware: TransformerMiddlewareFunction) => {
                return async (currentData: Record<string, any>) => {
                    const mergedData = { ...currentData, [key]: transformedValue }
                    const middlewareResult = await middleware(mergedData, next)
                    transformedValue = middlewareResult[key] ?? transformedValue
                    return middlewareResult
                }
            },
            async (partialData) => partialData
        )

        return await chain({ [key]: transformedValue })
    }
}