import "dotenv/config";
import express from "express";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { WebSocketServer } from "ws";

import mongoose from "mongoose";

import { Movie } from "./models/movie.model.js";

const wss = new WebSocketServer({ port: 8090 }); 

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port: ${process.env.PORT}`);
        });
    })
    .catch((err) => console.log("neel db error", err));

// const client = mongoose.connection.getClient();
// const database = client.db("opensoft_db");
// const movies = database.collection("movies");

const autocompleteMovies = async (searchTerm) => {


    const pipeline = [
        {
            $match: {
                $or: [{ title: { $regex: searchTerm || " ", $options: "i" } }],
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                poster: 1,
            },
        },
        // { $sort: { score: { $meta: "textScore" } } }, // Sort by relevance using text score
        { $limit: 10 }, // Limit the number of results
    ];

    // console.log(await Movie.findOne());

    const results = await Movie.aggregate(pipeline).exec();
    console.log(results);

    return results;
};

wss.on("connection", (ws) => {
    console.log("recv conn");

    ws.on("message", async (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.t === "autoc" && data.data) {
            console.log("searching", data.data);

            try {
                const result = await autocompleteMovies(data.data);
                ws.send(
                    JSON.stringify({
                        t: "autocreply",
                        data: result,
                    })
                );
            } catch (err) {
                console.log(err);

                ws.send(
                    JSON.stringify({
                        t: "error",
                        message: "Failed to perform autocomplete query",
                    })
                );
            }
        } else if (data.t === "info" && data.data) {
            console.log("recv for info", data.data);

            try {
                const id = new mongoose.Types.ObjectId(data.data);
                const document = await Movie.findById(id);
                ws.send(
                    JSON.stringify({
                        t: "inforeply",
                        data: document,
                    })
                );
                console.log("info sent");
            } catch (err) {
                ws.send(
                    JSON.stringify({
                        t: "error",
                        message: "Failed to fetch movie info",
                    })
                );
            }
        }
    });
});
