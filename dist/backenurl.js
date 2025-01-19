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
exports.URL_GEN = void 0;
const crypto = __importStar(require("crypto"));
const URL_GEN = (User_Handle, Method) => {
    const apiKey = "c5c475354d2a0d3b985866d388795a8365130a8b";
    const secret = "e8a5b6346c51986c1b42b230802fa9ab700b37b7";
    const randomString = Math.random().toString(36).substring(2, 8); // Random 6-character string
    const time = Math.floor(Date.now() / 1000); // Current UNIX time
    // Define the parameters for the request dynamically
    const params = {
        apiKey,
        time,
        handles: User_Handle,
        method: Method, // Accept method as argument
    };
    // Sort the parameters lexicographically by their keys
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&');
    // Create the string to be hashed (ignoring apiSig)
    const toHash = `${randomString}/?${sortedParams}#${secret}`;
    // Generate the SHA-512 hash
    const apiSig = crypto.createHash('sha512').update(toHash).digest('hex');
    // Build the final URL with query parameters
    const url = `https://codeforces.com/api/${Method}`; // Dynamic method
    const queryParams = `${sortedParams}&apiSig=${randomString}${apiSig}`;
    // Log the final request URL for debugging
    console.log('Request URL:', `${url}?${queryParams}`);
    // Return the URL
    return `${url}?${queryParams}`;
};
exports.URL_GEN = URL_GEN;
