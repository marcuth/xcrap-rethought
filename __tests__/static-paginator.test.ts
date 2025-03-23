import { InvalidUrlError, PageOutOfRangeError } from "../src/core/errors"
import { Client } from "../src/http"
import { StaticPaginator, Tracker } from "../src/utils/static-paginator"

describe("StaticPaginator", () => {
    let paginator: StaticPaginator

    beforeEach(() => {
        paginator = new StaticPaginator({
            initialPage: 1,
            lastPage: 10,
            templateUrl: "https://example.com/pages?page={page}"
        })
    })

    it("should initialize with the correct pages", () => {
        expect(paginator.initialPage).toBe(1)
        expect(paginator.lastPage).toBe(10)
        expect(paginator.currentPage).toBe(1)
        expect(paginator.templateUrl).toBe("https://example.com/pages?page={page}")
    })

    it("should generate the correct URL for the current page", () => {
        expect(paginator.current).toBe("https://example.com/pages?page=1")
    })

    it("should set the page correctly with the set method", () => {
        paginator.set(5)
        expect(paginator.currentPage).toBe(5)
        expect(paginator.current).toBe("https://example.com/pages?page=5")
    })

    it("should throw an error when the page is out of range with the set method", () => {
        expect(() => paginator.set(11)).toThrow(PageOutOfRangeError)
        expect(() => paginator.set(0)).toThrow(PageOutOfRangeError)
    })

    it("should go to the next page with the next method", () => {
        paginator.next()
        expect(paginator.currentPage).toBe(2)
        expect(paginator.current).toBe("https://example.com/pages?page=2")
    })

    it("should throw an error when unable to go to the next page", () => {
        paginator.set(10)
        expect(() => paginator.next()).toThrow(PageOutOfRangeError)
    })

    it("should go to the previous page with the previous method", () => {
        paginator.set(5)
        paginator.previous()
        expect(paginator.currentPage).toBe(4)
        expect(paginator.current).toBe("https://example.com/pages?page=4")
    })

    it("should throw an error when unable to go to the previous page", () => {
        paginator.set(1)
        expect(() => paginator.previous()).toThrow(PageOutOfRangeError)
    })

    it("should generate multiple URLs with the dump method", () => {
        const urls = paginator.dump()
        expect(urls).toHaveLength(10)
        expect(urls[0]).toBe("https://example.com/pages?page=1")
        expect(urls[9]).toBe("https://example.com/pages?page=10")
    })

    it("should generate a limited number of URLs with the dump method when given the limit", () => {
        const urls = paginator.dump(3)
        expect(urls).toHaveLength(3)
        expect(urls[0]).toBe("https://example.com/pages?page=1")
        expect(urls[2]).toBe("https://example.com/pages?page=3")
    })
})

describe("StaticPaginator.generateUrl", () => {
    it("should generate the correct URL for the given page", () => {
        const url = StaticPaginator.generateUrl("https://example.com/pages?page={page}", 5)
        expect(url).toBe("https://example.com/pages?page=5")
    })

    it("should throw an error if the URL does not contain '{page}'", () => {
        expect(() => StaticPaginator.generateUrl("https://example.com/pages", 5)).toThrow(InvalidUrlError)
    })
})

const mockClient = {
    fetch: jest.fn(),
    fetchMany: jest.fn(),
} satisfies Client

describe("StaticPaginator.createWithTracking", () => {
    let mockParser: any
    let trackers: { currentPage: Tracker; lastPage: Tracker }
    let mockResponse: any

    beforeEach(() => {
        mockParser = {
            parseFirst: jest.fn(),
        }

        mockResponse = {
            asHtmlParser: jest.fn().mockReturnValue(mockParser),
        }

        mockClient.fetch.mockResolvedValue(mockResponse)

        trackers = {
            currentPage: {
                query: "currentPageSelector",
                extractor: jest.fn(),
                transformer: jest.fn().mockReturnValue(1),
            },
            lastPage: {
                query: "lastPageSelector",
                extractor: jest.fn(),
                transformer: jest.fn().mockReturnValue(10),
            },
        }
    })

    it("deve criar o paginator com as páginas corretas a partir do tracking", async () => {
        const { paginator } = await StaticPaginator.createWithTracking({
            client: mockClient,
            request: { url: "https://example.com" },
            templateUrl: "https://example.com/pages?page={page}",
            trackers: trackers,
        })

        expect(paginator).toBeInstanceOf(StaticPaginator)
        expect(paginator.initialPage).toBe(1)
        expect(paginator.lastPage).toBe(10)
        expect(paginator.currentPage).toBe(1)
    })

    it("deve chamar o fetch do cliente HTTP com os parâmetros corretos", async () => {
        await StaticPaginator.createWithTracking({
            client: mockClient,
            request: { url: "https://example.com" },
            templateUrl: "https://example.com/pages?page={page}",
            trackers: trackers,
        })

        expect(mockClient.fetch).toHaveBeenCalledWith({ url: "https://example.com" })
    })

    it("deve usar o parser corretamente para extrair as páginas", async () => {
        mockParser.parseFirst.mockResolvedValueOnce('1').mockResolvedValueOnce("10")
        
        const { paginator } = await StaticPaginator.createWithTracking({
            client: mockClient,
            request: { url: "https://example.com" },
            templateUrl: "https://example.com/pages?page={page}",
            trackers,
        });

        expect(mockParser.parseFirst).toHaveBeenCalledWith(trackers.currentPage);
        expect(mockParser.parseFirst).toHaveBeenCalledWith(trackers.lastPage);
    })

    it("deve lançar um erro se o cliente falhar ao buscar os dados", async () => {
        mockClient.fetch.mockRejectedValueOnce(new Error('Request failed'))

        await expect(StaticPaginator.createWithTracking({
            client: mockClient,
            request: { url: "https://example.com" },
            templateUrl: "https://example.com/pages?page={page}",
            trackers,
        })).rejects.toThrow("Request failed")
    })

    it("deve usar os transformadores corretamente ao extrair as páginas", async () => {
        const currentPageTransformer = jest.fn().mockReturnValue(5)
        const lastPageTransformer = jest.fn().mockReturnValue(15)

        trackers.currentPage.transformer = currentPageTransformer
        trackers.lastPage.transformer = lastPageTransformer

        mockParser.parseFirst.mockResolvedValueOnce("5").mockResolvedValueOnce("15")

        const { paginator } = await StaticPaginator.createWithTracking({
            client: mockClient,
            request: { url: "https://example.com" },
            templateUrl: "https://example.com/pages?page={page}",
            trackers,
        })

        expect(currentPageTransformer).toHaveBeenCalledWith("5")
        expect(lastPageTransformer).toHaveBeenCalledWith("15")
        expect(paginator.initialPage).toBe(5)
        expect(paginator.lastPage).toBe(15)
    })

    it("deve lançar um erro se os trackers não retornarem valores válidos", async () => {
        mockParser.parseFirst.mockResolvedValueOnce(undefined).mockResolvedValueOnce(null)

        await expect(StaticPaginator.createWithTracking({
            client: mockClient,
            request: { url: "https://example.com" },
            templateUrl: "https://example.com/pages?page={page}",
            trackers: trackers,
        })).rejects.toThrow("Cannot read property")
    })
})