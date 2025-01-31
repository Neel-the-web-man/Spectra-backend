import { config } from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import { WebSocketServer } from "ws";

config();
const uri = `mongodb+srv://r:${process.env.dbpassforr}@cluster.eomop.mongodb.net/?retryWrites=true&w=majority&appName=cluster`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        deprecationErrors: true,
    },
});


client
    .connect({ useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const database = client.db("opensoft_db");
        const movies = database.collection("movies");
        const agg = [
            {
                $search: {
                    index: "title_search",
                    autocomplete: {
                        query: "germen",
                        path: "title",
                        fuzzy: { maxEdits: 1 },
                    },
                },
            },
            { $limit: 10 },
            { $project: { _id: 1, title: 1, poster: 1 } },
        ];
        const result = await movies.aggregate(agg);
        await result.forEach((doc) => console.log(doc));
    })
    .catch(console.dir)
    .finally(async () => {
        await client.close();
        console.log("closed");
    });
