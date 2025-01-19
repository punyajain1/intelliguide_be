"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countModel = exports.userModel = exports.messageModal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dbURL = process.env.BACKEND_KEY || "your_default_db_url";
mongoose_1.default.connect(dbURL);
const Schema = mongoose_1.default.Schema;
const user = new Schema({
    user_handle: String,
    rating: { default: 0, type: Number },
});
const count = new Schema({
    count: Number,
    new_count: Number
});
const message = new Schema({
    message: String
});
exports.messageModal = mongoose_1.default.model("message", message);
exports.userModel = mongoose_1.default.model("user", user);
exports.countModel = mongoose_1.default.model("count", count);
