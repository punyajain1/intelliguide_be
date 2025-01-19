import mongoose from "mongoose";
const dbURL: string = process.env.BACKEND_KEY || "your_default_db_url";
mongoose.connect(dbURL);
const Schema = mongoose.Schema;

const user = new Schema({
    user_handle: String,
    rating : {default: 0, type: Number},
})
const count = new Schema({
    count: Number,
    new_count: Number
})
const message = new Schema({
    message: String
})

export const messageModal = mongoose.model("message" , message);
export const userModel = mongoose.model("user" , user);
export const countModel = mongoose.model("count" , count);