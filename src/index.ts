import { StaticPaginator } from "./utils/static-paginator"

const paginator = new StaticPaginator({ initialPage: 1, lastPage: 10, templateUrl: "https://example.com/pages?page={page}" })

console.log(paginator.current)
console.log(paginator.next())
console.log(paginator.previous())
console.log(paginator.set(10))