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
exports.programinglangRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = __importDefault(require("openai"));
const promts_1 = require("../promt/promts");
const db_1 = require("../db");
const url_programinglang_1 = require("../url_gen/url_programinglang");
const { Router } = require("express");
const client = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
exports.programinglangRoute = Router();
// programinglangRoute.use(cors());
exports.programinglangRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userhandle = req.body.userhandle;
    let ans = {};
    try {
        if (!userhandle) {
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = (0, url_programinglang_1.URL_gen_programingLang)(userhandle);
        const info = yield axios_1.default.get(URL);
        const user = yield db_1.userModel.findOne({ user_handle: userhandle });
        if (!info) {
            res.status(404).json("cant find user data");
        }
        else {
            if (info.data.status === "OK") {
                const usercontest = info.data.result;
                //@ts-ignore
                let problems = usercontest.filter((submission) => submission.verdict === "OK");
                for (let submission of problems) {
                    if (submission.programmingLanguage === "C++17 (GCC 7-32)" || submission.programmingLanguage === "C++20 (GCC 13-64)" || submission.programmingLanguage === "C++14 (GCC 6-32)" || submission.programmingLanguage === "C++20 (GCC 11-64)") {
                        if (!ans["c++"]) {
                            ans["c++"] = 1;
                        }
                        else {
                            ans["c++"]++;
                        }
                    }
                    else {
                        if (!ans[submission.programmingLanguage]) {
                            ans[submission.programmingLanguage] = 1;
                        }
                        else {
                            ans[submission.programmingLanguage]++;
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
                                    content: `Write a short guiding peragraph according to number of questions solved on codeforce (i want you to guide like if there are less number of question in c++ you must tell me to improve myself in c++ as c++ is most popular , fastest and time efficient language . with this also tell me about the most common mistakes and topics to not skip while doing c++ like try exploring inbuilt functions of collection of framework etc, also give me some resources to practice, same for other language present in here too- ${JSON.stringify(ans)} (reply in second person) `,
                                },
                            ],
                            model: "gpt-4o-mini-2024-07-18",
                            temperature: 0.2,
                            max_tokens: 1500,
                            top_p: 1
                        });
                        chatCompletion = chat.choices[0].message.content;
                    }
                    catch (e) {
                        console.log(e);
                        chatCompletion = `We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the updated analysis of Programing Language used By you.`;
                    }
                }
                else {
                    chatCompletion = `Wow, a Codeforces rating above ${user === null || user === void 0 ? void 0 : user.rating}? You're basically the Chuck Norris of competitive programming—solving problems faster than they can be created! You've already left the mere mortals in the dust.Now that you're flexing that algorithmic muscle, why not venture into new realms? Try out some exotic programming languages. Who knows? Maybe you'll be solving problems in Brainf**k or golfing in J with your left hand while sipping coffee with the right! Keep conquering, and remember, even geniuses need a new playground now and then!`;
                }
                const response = {
                    "data": ans,
                    "guidance": chatCompletion,
                };
                res.json(response);
            }
            else {
                res.status(404).json("can not find user");
            }
        }
    }
    catch (e) {
        res.status(500).json(e);
    }
}));
