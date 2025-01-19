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
Object.defineProperty(exports, "__esModule", { value: true });
exports.countRoute = void 0;
const express_1 = require("express");
const db_1 = require("../db");
exports.countRoute = (0, express_1.Router)();
exports.countRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userhandle = req.body.user_handle;
    try {
        const existingUser = yield db_1.userModel.findOne({ user_handle: userhandle });
        const countDoc = yield db_1.countModel.findOne();
        if (existingUser) {
            if (countDoc) {
                yield db_1.countModel.findByIdAndUpdate(countDoc._id, {
                    $inc: { count: 1 }
                });
            }
        }
        else {
            yield db_1.userModel.create({ user_handle: userhandle });
            if (!countDoc) {
                yield db_1.countModel.create({ count: 1, new_count: 1 });
            }
            else {
                yield db_1.countModel.findByIdAndUpdate(countDoc._id, {
                    $inc: { count: 1, new_count: 1 }
                });
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}));
