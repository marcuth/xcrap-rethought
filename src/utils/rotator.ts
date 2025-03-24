import { EmptyArrayError } from "../core/errors"

export class Rotator {
    current = 0

    constructor(readonly values: string[]) {
        if (values.length === 0) {
            throw new EmptyArrayError(Rotator.name)
        }
    }

    rotate() {
        this.current = (this.current + 1) % this.values.length
        return this.values[this.current]
    }
}