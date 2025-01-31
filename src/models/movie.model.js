import mongoose, { Schema } from "mongoose";

const movieSchema = new mongoose.Schema({
    title: String,
    poster: String,
    year: Number,
    imdbVotes: Number,
    imdbRating: Number,
    director: String,
    cast: [String],
    genre: [String],
    language: String
});

export const Movie = mongoose.model('Movie', movieSchema);