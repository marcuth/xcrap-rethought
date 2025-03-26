
import { ArrayTransformer, StringTransformer, transform, Transformer, TransformingModel } from "../src/transformer"
import { extract, parsingModelFactory } from "../src/parser"
import { AxiosClient } from "../src/http"

const missionParsingModel = parsingModelFactory.html({
    icon: {
        query: ".mi img",
        extractor: extract("src", true)
    },
    type: {
        query: ".mh",
        extractor: extract("innerText")
    },
    goalItems: {
        query: ".mz:nth-child(1) .m2",
        extractor: extract("innerText")
    },
    poolSize: {
        query: ".mz:nth-child(2) .m2",
        extractor: extract("innerText")
    },
    poolTimeForOne: {
        query: ".mz:nth-child(3) .m2",
        extractor: extract("innerText")
    },
    poolTimeForAll: {
        query: ".mz:nth-child(5) .m2",
        extractor: extract("innerText")
    },
    collectChance: {
        query: ".mz:nth-child(4) .m2",
        extractor: extract("innerText")
    }
})

const nodeParsingModel = parsingModelFactory.html({
    title: {
        query: ".nnh",
        extractor: extract("innerText")
    },
    missions: {
        query: ".mm",
        model: missionParsingModel
    }
})

const lapParsingModel = parsingModelFactory.html({
    nodes: {
        query: ".nn",
        multiple: true,
        model: nodeParsingModel
    }
})

const rootParsingModel = parsingModelFactory.html({
    laps: {
        query: ".hl",
        multiple: true,
        model: lapParsingModel
    }
})

const missionTransformingModel = new TransformingModel({
    icon: [
        transform({
            key: "icon",
            transformer: StringTransformer.resolveUrl("https://deetlist.com/dragoncity/events/race")
        })
    ],
    type: [
        transform({
            key: "type",
            transformer: StringTransformer.lookupInRecord({
                "Battle Dragons": "battle",
                "Hatch Eggs": "hatch",
                "Collect Food": "food",
                "Feed Dragons": "feed",
                "Collect Gold": "gold",
                "League Battles": "pvp"
            })
        })
    ],
    goalItems: [
        transform({
            key: "goalItems",
            transformer: StringTransformer.toNumber
        })
    ],
    poolSize: [
        transform({
            key: "goalItems",
            transformer: StringTransformer.toNumber
        })
    ],
})

const nodeTransformingModel = new TransformingModel({
    nodeNumber: [
        transform({
            key: "title",
            transformer: StringTransformer.split("-")
        }),
        transform({
            key: "nodeNumber",
            transformer: ArrayTransformer.last
        }),
        transform({
            key: "nodeNumber",
            transformer: StringTransformer.split("-")
        }),
        transform({
            key: "nodeNumber",
            transformer: ArrayTransformer.last
        }),
        transform({
            key: "nodeNumber",
            transformer: StringTransformer.toNumber
        })
    ],
    lapNumber: [
        transform({
            key: "title",
            transformer: StringTransformer.split("-")
        }),
        transform({
            key: "lapNumber",
            transformer: ArrayTransformer.first
        }),
        transform({
            key: "lapNumber",
            transformer: StringTransformer.split("-")
        }),
        transform({
            key: "lapNumber",
            transformer: ArrayTransformer.last
        }),
        transform({
            key: "lapNumber",
            transformer: StringTransformer.toNumber
        })
    ],
    missions: {
        multiple: true,
        model: missionTransformingModel
    }
})

const lapTransformingModel = new TransformingModel({
    nodes: {
        multiple: true,
        model: nodeTransformingModel
    }
})

const rootTransformingModel = new TransformingModel({
    laps: {
        multiple: true,
        model: lapTransformingModel
    }
})

async function start() {
    const url = "http://deetlist.com/dragoncity/events/race"
    const client = new AxiosClient()
    const response = await client.fetch({ url: url })
    const parser = response.asHtmlParser()
    const rawData = await parser.extractFirst({ model: rootParsingModel })
    const transformer = new Transformer(rawData)
    const transfomedData = await transformer.transform(rootTransformingModel)

    console.dir(transfomedData, { depth: null })
}

start()