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
exports.VerdictRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = __importDefault(require("openai"));
const promts_1 = require("../promt/promts");
const url_verdict_1 = require("../url_gen/url_verdict");
const { Router } = require("express");
const client = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
exports.VerdictRoute = Router();
exports.VerdictRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userhandle = req.body.userhandle;
    try {
        if (!userhandle) {
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = (0, url_verdict_1.URL_gen_verdict)(userhandle);
        const response = yield axios_1.default.get(URL);
        if (response.data.status === 'OK') {
            const info = response.data.result;
            const submittied = {};
            for (let it of info) {
                if (!submittied[it.verdict]) {
                    submittied[it.verdict] = 1;
                }
                else {
                    submittied[it.verdict]++;
                }
            }
            let chatforsubmission;
            try {
                let chat = yield client.chat.completions.create({
                    messages: [
                        {
                            "role": "system",
                            "content": promts_1.PROFILE_ANALYZER_PROMPT,
                        },
                        {
                            role: 'user',
                            content: `write a short summry about my submission verdict in codeforces and tell me about how to improve: ${JSON.stringify(submittied)} (reply in second person)`,
                        },
                    ],
                    model: "gpt-4o-mini-2024-07-18",
                    temperature: 0.5,
                    max_tokens: 1500,
                    top_p: 1
                });
                chatforsubmission = chat.choices[0].message.content;
            }
            catch (_a) {
                chatforsubmission = "We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the updated Verdict Improvent guide.";
            }
            const fdata = {
                "data": submittied,
                "gpt_review": chatforsubmission
            };
            res.json(fdata);
        }
        else {
            res.status(404).json("error");
        }
    }
    catch (e) {
        res.status(500).json(e);
    }
}));
