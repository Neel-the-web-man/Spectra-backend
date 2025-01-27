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

const wss = new WebSocketServer({ port: 8000 });

const agg = [
    {
        $search: {
            text: {
                query: "Summer",
                path: "title",
            },
        },
    },
    {
        $limit: 5,
    },

    {
        $project: {
            _id: 0,
            title: 1,
        },
    },
];

client
    .connect({ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        wss.on("connection", (ws, req) => {
            // handle auth
            console.log("recv conn");

            ws.on("message", async (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.t == "autoc") {
                    // execute search
                    console.log("searching");

                    let cursor = await movies.aggregate(agg);
                    await cursor.forEach((doc) => console.log(doc));
                    ws.send(JSON.stringify({ t: "autocreply", data: "hello" }));
                }
            });
        });
    })
    .catch(console.dir);
// .finally(() => {
//     client.close().then(() => {
//         console.log("connection to db closed");
//     });
// });
