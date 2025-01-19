"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userratingRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = __importDefault(require("openai"));
const promts_1 = require("../promt/promts");
const url_rating_1 = require("../url_gen/url_rating");
const { Router } = require("express");
exports.userratingRoute = Router();
const client = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.userratingRoute.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userhandle = req.body.userhandle;
        if (!userhandle) {
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = (0, url_rating_1.URL_gen_rating)(userhandle);
        yield delay(2000);
        const response = yield axios_1.default.get(URL);
        const data = response.data.result;
        const firstFive = data.slice(0, 5);
        const lastFive = data.slice(-5);
        try {
            let chatCompletion;
            try {
                let chat = yield client.chat.completions.create({
                    messages: [
                        {
                            "role": "system",
                            "content": promts_1.PROFILE_ANALYZER_PROMPT,
                        },
                        {
                            role: 'user',
                            content: `Write a short summery of about me from the following Codeforces raiting information of myself: my raitingn and info at start: ${JSON.stringify(firstFive)}
                            my current raiting in last 5 contest:${JSON.stringify(lastFive)} (include things like how my raiting reflects topics i know like if rating is between 1200-1400 i must be knowing graphs , trees etc. reply in second person , if my rating is between 0-1000 i must be knowing basic starting topics like input/output , arrays , strings ,etc. )`,
                        },
                    ],
                    model: "gpt-4o-mini-2024-07-18",
                    temperature: 0.4,
                    max_tokens: 1500,
                    top_p: 1
                });
                chatCompletion = chat.choices[0].message.content;
            }
            catch (e) {
                console.log(e);
                chatCompletion = `We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the Rating analysis of your profile.`;
            }
            const ans = {
                "summary": chatCompletion,
                "result": data
            };
            res.json(ans);
        }
        catch (openAIError) {
            console.error('OpenAI API Error:', openAIError);
        }
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
