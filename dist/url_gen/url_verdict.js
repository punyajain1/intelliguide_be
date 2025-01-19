"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_gen_verdict = void 0;
const crypto = __importStar(require("crypto"));
const URL_gen_verdict = (userHandle) => {
    const baseUrl = `https://codeforces.com/api/user.status`;
    const apiKey = "e1fd2bff4e29449b2a13cade68ecefb8503df232";
    const secret = "fb0b3feb8273be2b91db2f16f8feb4dfb0dec09a";
    const randomString = Math.random().toString(36).substring(2, 8);
    const time = Math.floor(Date.now() / 1000);
    const queryParams = { handle: userHandle, apiKey, time: time.toString(), };
    const sortedParams = Object.entries(queryParams)
        .sort(([keyA, valueA], [keyB, valueB]) => keyA === keyB ? valueA.localeCompare(valueB) : keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    const toHash = `${randomString}/user.status?${sortedParams}#${secret}`;
    const apiSigHash = crypto.createHash("sha512").update(toHash).digest("hex");
    const apiSig = `${randomString}${apiSigHash}`;
    return `${baseUrl}?${sortedParams}&apiSig=${apiSig}`;
};
exports.URL_gen_verdict = URL_gen_verdict;
