import { config } from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
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

client
    .connect({ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const database = client.db("opensoft_db");
        const movies = database.collection("movies");

        console.log("started");

        wss.on("connection", (ws) => {
            // handle auth
            console.log("recv conn");

            ws.on("message", async (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.t == "autoc" && data.data) {
                    // execute search
                    console.log("searching");
                    const result = await movies.aggregate([
                        {
                            $search: {
                                index: "title_search",
                                autocomplete: {
                                    query: data.data,
                                    path: "title",
                                    tokenOrder: "sequential",
                                    fuzzy: { maxEdits: 1, prefixLength: 1 },
                                },
                            },
                        },
                        { $limit: 10 },
                        { $project: { _id: 1, title: 1, poster: 1 } },
                    ]);

                    const resd = await result;
                    console.log(resd);

                    ws.send(
                        JSON.stringify({
                            t: "autocreply",
                            data: await result.toArray(),
                        })
                    );
                } else if (data.t == "info" && data.data) {
                    console.log("recv for info");

                    const id = new ObjectId(data.data);
                    const document = await movies.findOne({
                        _id: id,
                    });
                    ws.send(JSON.stringify({ t: "inforeply", data: document }));
                    console.log('info sentF');
                    
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
