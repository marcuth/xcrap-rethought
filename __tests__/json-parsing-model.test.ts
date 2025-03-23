import { JsonParsingModel } from "../src/parser/json-parsing-model"

describe("JsonParsingModel", () => {
    test("should correctly map JSON properties", async () => {
        const json = JSON.stringify({ name: "Marcuth", age: 19, contact: { email: "test@email.com" } })

        const parsingModel = new JsonParsingModel({
            username: "name",
            email: "contact.email",
            age: "age"
        })

        const data = parsingModel.parse(json)

        expect(data).toEqual({
            username: "Marcuth",
            email: "test@email.com",
            age: 19
        })
    })

    test("should return null for missing properties", async () => {
        const json = JSON.stringify({ name: "Marcuth" })

        const parsingModel = new JsonParsingModel({
            username: "name",
            email: "contact.email"
        })

        const data = parsingModel.parse(json)

        expect(data).toEqual({
            username: "Marcuth",
            email: null
        })
    })

    test("should throw error for invalid JSON", async () => {
        const invalidJson = "{ name: 'Marcuth' "

        const parsingModel = new JsonParsingModel({ username: "name" })

        expect(() => parsingModel.parse(invalidJson)).toThrow(SyntaxError)
    })
})
