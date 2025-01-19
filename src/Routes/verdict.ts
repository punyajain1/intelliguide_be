import axios from "axios";
import OpenAI from 'openai';
import { Request, Response } from "express";
import { PROFILE_ANALYZER_PROMPT } from "../promt/promts";
import { URL_gen_verdict } from "../url_gen/url_verdict";
const { Router } = require("express");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const VerdictRoute = Router();

VerdictRoute.post("/" , async(req: Request , res: Response)=>{
    const userhandle = req.body.userhandle;
    try{
        if (!userhandle){
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = URL_gen_verdict(userhandle);
        const response:any = await axios.get(URL);
        if (response.data.status === 'OK') {
            const info = response.data.result;
            const submittied: Record<string, number> = {};
            for(let it of info){
                if(!submittied[it.verdict]){
                    submittied[it.verdict]=1;
                }else{
                    submittied[it.verdict]++;
                }
            }
            let chatforsubmission:any;
            try{
                let chat = await client.chat.completions.create({
                    messages: [
                        {
                            "role": "system",
                            "content": PROFILE_ANALYZER_PROMPT,
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
                })
                chatforsubmission = chat.choices[0].message.content
            }catch{
                chatforsubmission="We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the updated Verdict Improvent guide.";
            }

            const fdata = {
                "data":submittied,
                "gpt_review": chatforsubmission
            }
            res.json(fdata);
        }else{
            res.status(404).json("error");
        }
    } catch(e) {
        res.status(500).json(e);
    }
})