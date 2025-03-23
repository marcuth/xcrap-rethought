import axios, { AxiosHeaders, AxiosResponse } from "axios"

import { AxiosClient } from "../src/http"

jest.mock("axios")

jest.mock("axios-rate-limit", () => {
    return jest.fn().mockImplementation((axiosInstance) => {
        return axiosInstance
    })
})

describe("AxiosClient", () => {
    let axiosClient: AxiosClient

    const mockAxiosResponse: AxiosResponse = {
        data: "test data",
        status: 200,
        statusText: "OK",
        headers: {},
        request: {},
        config: {
            headers: new AxiosHeaders()
        }
    }

    beforeEach(() => {
        axiosClient = new AxiosClient()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("fetch", () => {
        it("deve fazer uma requisição GET e retornar uma resposta com sucesso", async () => {
            const axiosRequestMock = axios.request as jest.Mock

            axiosRequestMock.mockResolvedValue(mockAxiosResponse)

            const response = await axiosClient.fetch({
                url: "/test-url",
                method: "GET",
            })

            expect(axios.request).toHaveBeenCalledWith({
                url: "/test-url",
                method: "GET",
            })
            expect(response.status).toBe(200)
            expect(response.body).toBe("test data")
        })

        // it("deve tentar novamente se a requisição falhar e exceder o número de tentativas", async () => {
        //     const mockErrorResponse = {
        //         response: {
        //             status: 500,
        //             statusText: "Internal Server Error",
        //             data: "Error",
        //         },
        //     }

        //     const axiosRequestMock = axios.request as jest.Mock

        //     axiosRequestMock
        //         .mockRejectedValueOnce(mockErrorResponse)
        //         .mockRejectedValueOnce(mockErrorResponse)
        //         .mockResolvedValue(mockAxiosResponse)

        //     const response = await axiosClient.fetch({
        //         url: "/test-url",
        //         method: "GET",
        //         maxRetries: 2,
        //     })

        //     expect(axios.request).toHaveBeenCalledTimes(3)
        //     expect(response.status).toBe(200)
        //     expect(response.body).toBe("test data")
        // })

        // it("deve retornar um erro HTTP quando o código de status for inválido", async () => {
        //     const invalidResponse = {
        //         status: 400,
        //         statusText: "Bad Request",
        //         data: "Bad Request",
        //     }

        //     const axiosRequestMock = axios.request as jest.Mock

        //     axiosRequestMock.mockResolvedValue(invalidResponse)

        //     const response = await axiosClient.fetch({
        //         url: "/test-url",
        //         method: "GET",
        //     })

        //     expect(response.status).toBe(400)
        //     expect(response.body).toBe("Bad Request")
        //     expect(response.failedAttempts.length).toBe(1)
        // })

        // it("deve retornar um erro caso o axios lance um erro desconhecido", async () => {
        //     const unknownError = new Error("Unknown Error")
        //     const axiosRequestMock = axios.request as jest.Mock

        //     axiosRequestMock.mockRejectedValue(unknownError)

        //     const response = await axiosClient.fetch({
        //         url: "/test-url",
        //         method: "GET",
        //     })

        //     expect(response.status).toBe(500)
        //     expect(response.body).toBe("Unknown error")
        //     expect(response.failedAttempts.length).toBe(1)
        // })
    })

    // describe("fetchMany", () => {
    //     it("deve executar várias requisições em paralelo e retornar as respostas", async () => {
    //         const mockRequest1 = { url: "/test1", method: "GET" }
    //         const mockRequest2 = { url: "/test2", method: "GET" }

    //         const axiosRequestMock = axios.request as jest.Mock

    //         axiosRequestMock
    //             .mockResolvedValueOnce(mockAxiosResponse)
    //             .mockResolvedValueOnce(mockAxiosResponse)

    //         const results = await axiosClient.fetchMany({
    //             requests: [mockRequest1, mockRequest2],
    //             concurrency: 2,
    //             requestDelay: 0,
    //         })

    //         expect(axios.request).toHaveBeenCalledTimes(2)
    //         expect(results.length).toBe(2)
    //         expect(results[0].status).toBe(200)
    //         expect(results[1].status).toBe(200)
    //     })

    //     it("deve respeitar a concorrência configurada", async () => {
    //         const mockRequest = { url: "/test-url", method: "GET" }

    //         const axiosRequestMock = axios.request as jest.Mock

    //         axiosRequestMock.mockResolvedValue(mockAxiosResponse)

    //         const results = await axiosClient.fetchMany({
    //             requests: [mockRequest, mockRequest],
    //             concurrency: 1,
    //             requestDelay: 0,
    //         })

    //         expect(axios.request).toHaveBeenCalledTimes(2)
    //         expect(results.length).toBe(2)
    //     })
    // })

    // describe("interceptors", () => {
    //     it("deve configurar interceptores de requisição corretamente", async () => {
    //         const requestInterceptorSpy = jest.fn()
    //         axiosClient.interceptors.request.use(requestInterceptorSpy)

    //         await axiosClient.fetch({
    //             url: "/test-url",
    //             method: "GET",
    //         })

    //         expect(requestInterceptorSpy).toHaveBeenCalled()
    //     })
    // })
})
