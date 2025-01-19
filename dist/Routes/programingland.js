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
const { Router } = require("express");
const client = new openai_1.default({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: "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"
});
exports.programinglangRoute = Router();
// programinglangRoute.use(cors());
exports.programinglangRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userhandle = req.body.userhandle;
    let ans = {};
    try {
        const info = yield axios_1.default.get(`https://codeforces.com/api/user.status?handle=${userhandle}&from=1&count=1000`);
        if (!info) {
            res.status(404).json("cant find user data");
        }
        else {
            if (info.data.status === "OK") {
                const usercontest = info.data.result;
                //@ts-ignore
                let problems = usercontest.filter((submission) => submission.verdict === "OK");
                for (let submission of problems) {
                    if (submission.programmingLanguage === "C++17 (GCC 7-32)" || submission.programmingLanguage === "C++20 (GCC 13-64)") {
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
                try {
                    let chat = yield client.chat.completions.create({
                        messages: [
                            {
                                role: 'user',
                                content: `write a short guiding peragraph according to number of questions solved on codeforce (i want you to guide like if there are less number of question in c++ you must tell me to improve myself in c++ as c++ is most popular , fastest and time efficient language . with this also tell me about the most common mistakes and topics to not skip while doing c++ like try exploring inbuilt functions of collection of framework etc, also give me some resources to practice like takeyouforward by striver , codewithharry's playlist , kunal kushwah's playlist etc to practice same for other language present in here too) ${JSON.stringify(ans)} (reply in second person , if ${usercontest.raiting} > 2100 congratulate and jut tell to explore other languages)`,
                            },
                        ],
                        model: "gpt-4o",
                        temperature: 1,
                        max_tokens: 400,
                        top_p: 1
                    });
                    chatCompletion = chat.choices[0].message.content;
                }
                catch (_a) {
                    chatCompletion = "Error with AI call";
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
