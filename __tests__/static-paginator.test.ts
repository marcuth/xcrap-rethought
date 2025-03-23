import { InvalidUrlError, PageOutOfRangeError } from "../src/core/errors"
import { StaticPaginator } from "../src/utils/static-paginator"

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
