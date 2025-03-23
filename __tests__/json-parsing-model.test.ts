import { parsingModelFactory } from "../src/parser"

describe("JsonParsingModel integration test", () => {
    test("should correctly map JSON properties", async () => {
        const json = JSON.stringify({ name: "Marcuth", age: 19, contact: { email: "test@email.com" } })

        const parsingModel = parsingModelFactory.json({
            username: {
                query: "name"
            },
            email: {
                query: "contact.email"
            },
            age: {
                query: "age"
            }
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

        const parsingModel = parsingModelFactory.json({
            username: {
                query: "name"
            },
            email: {
                query: "contact.email"
            }
        })

        const data = parsingModel.parse(json)

        expect(data).toEqual({
            username: "Marcuth",
            email: null
        })
    })

    test("should throw error for invalid JSON", async () => {
        const invalidJson = "{ name: 'Marcuth' "

        const parsingModel = parsingModelFactory.json({
            username: {
                query: "name"
            }
        })

        expect(() => parsingModel.parse(invalidJson)).toThrow(SyntaxError)
    })
})
