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
exports.accuracyRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = __importDefault(require("openai"));
const promts_1 = require("../promt/promts");
const db_1 = require("../db");
const url_accuracy_1 = require("../url_gen/url_accuracy");
const { Router } = require("express");
const client = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
exports.accuracyRoute = Router();
exports.accuracyRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userhandle = req.body.userhandle;
    try {
        if (!userhandle) {
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = (0, url_accuracy_1.URL_gen_accuracy)(userhandle);
        const response = yield axios_1.default.get(URL);
        const user = yield db_1.userModel.findOne({ user_handle: userhandle });
        if (response.data.status === 'OK') {
            const info = response.data.result;
            //@ts-ignore
            const acceptedProblem = info.filter(submission => ["OK"].includes(submission.verdict));
            const topicsRight = {};
            //@ts-ignore
            acceptedProblem.forEach(problem => {
                //@ts-ignore
                problem.problem.tags.forEach(tag => {
                    if (!topicsRight[tag]) {
                        topicsRight[tag] = 0;
                    }
                    topicsRight[tag]++;
                });
            });
            //@ts-ignore
            const rejectedProblems = info.filter(submission => ["WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR", "MEMORY_LIMIT_EXCEEDED", "SKIPPED", "CHALLENGED"].includes(submission.verdict));
            const topicAnalysis = {};
            //@ts-ignore
            rejectedProblems.forEach(problem => {
                //@ts-ignore
                problem.problem.tags.forEach(tag => {
                    if (!topicAnalysis[tag]) {
                        topicAnalysis[tag] = 0;
                    }
                    topicAnalysis[tag]++;
                });
            });
            for (let right in topicsRight) {
                if (right in topicAnalysis) {
                    topicAnalysis[right] = topicAnalysis[right] - topicsRight[right];
                    if (topicAnalysis[right] < 0) {
                        delete topicAnalysis[right];
                    }
                }
            }
            let chatCompletion;
            if (((_a = user === null || user === void 0 ? void 0 : user.rating) !== null && _a !== void 0 ? _a : 0) < 2000) {
                try {
                    let chat = yield client.chat.completions.create({
                        messages: [
                            {
                                "role": "system",
                                "content": promts_1.PROFILE_ANALYZER_PROMPT,
                            },
                            {
                                role: 'user',
                                content: `Based on my current performance and the data i will provided, you have to    created a tailored plan to help me improve my skills in both all the wrong topics accoured(like the data contains the nuber topic and number of times i did it wrong) while also identifying key areas in my problem-solving techniques,include to whoom should i give my most priority from list of wrong qustions and which topic accoording to you is most important from the list irrespective of numebers of wrong attempts:list=${JSON.stringify(topicAnalysis)} (dont ask for any followup question and dont include the list of topics , reply in second person.)`,
                            },
                        ],
                        model: "gpt-4o-mini-2024-07-18",
                        temperature: 0.4,
                        max_tokens: 1500,
                        top_p: 1
                    });
                    chatCompletion = chat.choices[0].message.content;
                }
                catch (_b) {
                    chatCompletion = "We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later.";
                }
            }
            else {
                chatCompletion = "Hi!! You are already at a good rank, and it's natural that some of these questions might be from when you were just starting out. It’s okay to ignore them now, as they were likely harder back then but may seem easier now. Focus on advancing your skills with newer, more challenging problems instead!";
            }
            const fdata = {
                "tag_wise": topicAnalysis,
                "gpt_guide": chatCompletion
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
