import "dotenv/config";
import express from "express";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { WebSocketServer } from "ws";

import mongoose from "mongoose";

import { Movie } from "./models/movie.model.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("neel db error", err));

// const wss = new WebSocketServer({ port: 8001 });

// const client = mongoose.connection.getClient();
// const database = client.db("opensoft_db");
// const movies = database.collection("movies");

// const autocompleteMovies = async (searchTerm) => {

//     const pipeline = [
//         {
//             $search: {
//                 autocomplete: {
//                     query: searchTerm,
//                     path: "title",
//                     fuzzy: {
//                         maxEdits: 2,
//                     },
//                 },
//             },
//         },
//         {
//             $limit: 10,
//         },
//         {
//             $project: {
//                 title: 1,
//                 poster: 1,
//             },
//         },
//     ];

//     const results = await movies.aggregate(pipeline).toArray();
//     return results;
// };

// const uri =
//     `mongodb+srv://r:${process.env.dbpassforr}@cluster.eomop.mongodb.net/?retryWrites=true&w=majority&appName=cluster`;

// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         // strict: true,
//         deprecationErrors: true,
//     },
// });

// client
//     .connect({ useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         const database = client.db("opensoft_db");
//         const movies = database.collection("movies");

//         console.log("started");

//         wss.on("connection", (ws) => {
//             // handle auth
//             console.log("recv conn");

//             ws.on("message", async (msg) => {
//                 // console.log(await movies.findOne());
//                 const data = JSON.parse(msg.toString());
//                 if (data.t == "autoc" && data.data) {
//                     // execute search
//                     console.log("searching");

//                     // const result = await autocompleteMovies(data.data);
//                     const result = await movies.aggregate([
//                         {
//                             $search: {
//                                 index: "title_search",
//                                 autocomplete: {
//                                     query: data.data,
//                                     path: "title",
//                                     tokenOrder: "sequential",
//                                     fuzzy: { maxEdits: 1, prefixLength: 1 },
//                                 },
//                             },
//                         },
//                         { $limit: 10 },
//                         { $project: { _id: 1, title: 1, poster: 1 } },
//                     ]);

//                     ws.send(
//                         JSON.stringify({
//                             t: "autocreply",
//                             data: await result.toArray(),
//                         }),
//                     );
//                 } else if (data.t == "info" && data.data) {
//                     console.log("recv for info");

//                     // const id = new mongoose.Types.ObjectId(data.data);
//                     // const document = await Movie.findById(id);

//                     const id = new ObjectId(data.data);
//                     const document = await movies.findOne({
//                         _id: id,
//                     });
//                     ws.send(JSON.stringify({ t: "inforeply", data: document }));
//                     console.log("info sentF");
//                 }
//             });
//         });
//     })
//     .catch((err) => {
//         console.error("db connection error ", err);
//     });
