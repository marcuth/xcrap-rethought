export type TransformingMiddleware = (data: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>

export type TransformingModelShape = {
    [key: string]: TransformingMiddleware[];
};

export class TransformingModel {
    constructor(readonly shape: TransformingModelShape) {}

    async transform(data: Record<string, any>): Promise<Record<string, any>> {
        const result: Record<string, any> = {...data}

        for (const key in this.shape) {
            if (key in data) {
                const middlewares = this.shape[key]
                let transformedValue = data[key]

                for (const middleware of middlewares) {
                    const middlewareResult = await middleware({ ...result, [key]: transformedValue })
                    transformedValue = middlewareResult[key]
                }

                result[key] = transformedValue
            }
        }

        return result
    }
}