import axios from "axios";
import OpenAI from 'openai';
import { Request, Response } from "express";
import { PROFILE_ANALYZER_PROMPT } from "../promt/promts";
import { URL_gen_rating } from "../url_gen/url_rating";
const { Router } = require("express");


export const userratingRoute = Router();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

userratingRoute.post('/' , async(req : Request , res : Response)=>{
    try{
        const userhandle = req.body.userhandle;
        if (!userhandle){
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = URL_gen_rating(userhandle)
        await delay(2000);
        const response:any = await axios.get(URL);
        const data = response.data.result;
        const firstFive = data.slice(0, 5);
        const lastFive = data.slice(-5);

        try {
            let chatCompletion:string | null;
            try{
                let chat = await client.chat.completions.create({
                    messages: [
                        {
                            "role": "system",
                            "content": PROFILE_ANALYZER_PROMPT,
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
                chatCompletion = chat.choices[0].message.content 
            }catch(e){
                console.log(e);
                chatCompletion = `We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the Rating analysis of your profile.`;
            }


            const ans = {
                "summary": chatCompletion ,
                "result": data
            }
            res.json(ans);
        } catch (openAIError) {
            console.error('OpenAI API Error:', openAIError);
        }
    }catch(e){
        res.status(500).json({error: e});
    }
})
