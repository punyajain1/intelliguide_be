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
exports.usercontestRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const url_contest_1 = require("../url_gen/url_contest");
const { Router } = require("express");
exports.usercontestRoute = Router();
exports.usercontestRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userhandle = req.body.userhandle;
    try {
        if (!userhandle) {
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = (0, url_contest_1.URL_gen_contest)(userhandle);
        const response = yield axios_1.default.get(URL);
        if (response.data.status === "OK") {
            let ContestWrong = {};
            const ContestRight = new Set();
            const info = response.data.result;
            info.forEach((it) => {
                const pname = it.problem.name;
                if (it.verdict === "OK") {
                    ContestRight.add(pname);
                    delete ContestWrong[pname];
                }
                else {
                    if (!ContestRight.has(pname)) {
                        ContestWrong[pname] = {
                            tags: it.problem.tags,
                            contestId: it.problem.contestId,
                            index: it.problem.index
                        };
                    }
                }
            });
            res.json({
                wrong: ContestWrong,
            });
        }
        else {
            res.status(404).json("error with api");
        }
    }
    catch (e) {
        //@ts-ignore
        res.status(500).json(e.message);
    }
}));
