import "dotenv/config";
import mongoose from "mongoose";

const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
console.log("db connected");

const movieSchema = new mongoose.Schema({
    title: String,
    poster: String,
    year: Number,
    imdbVotes: Number,
    imdbRating: Number,
    director: String,
    cast: [String],
    genre: [String],
    language: String,
});

const Movie = mongoose.model("Movie", movieSchema);

// console.log(await Movie.findOne());

// const pipeline = [
//     {
//         $search: {
//             autocomplete: {
//                 query: 'hi',
//                 path: "title",
//                 fuzzy: {
//                     maxEdits: 2,
//                 },
//             },
//         },
//     },
//     {
//         $limit: 3,
//     },
//     {
//         $project: {
//             title: 1,
//             poster: 1,
//         },
//     },
// ];

const pipeline = [
    {
        $match: {
            $or: [
                // Search across multiple fields (adjust as needed)
                { title: { $regex: 'hitler', $options: "i" } }, // Case-insensitive search
                // { description: { $regex: searchTerm, $options: "i" } },
                // { otherField: { $regex: searchTerm, $options: "i" } }, // Add more fields
            ],
        },
    },
    {
        $project: {
            _id: 1, // Always include _id
            title: 1,
            poster: 1,
            // score: { $meta: "textScore" }, // Include text score if using $text
        },
    },
    // { $sort: { score: { $meta: "textScore" } } }, // Sort by relevance using text score
    { $limit: 10 }, // Limit the number of results
];

const doc = await Movie.aggregate(pipeline).exec();

console.log(doc);
