import axios from "axios";
import OpenAI from 'openai';
import { Request, Response } from "express";
import { PROFILE_ANALYZER_PROMPT } from "../promt/promts";
import { userModel } from "../db";
import { URL_gen_programingLang } from "../url_gen/url_programinglang";
const { Router } = require("express");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const programinglangRoute = Router();
// programinglangRoute.use(cors());

programinglangRoute.post("/" , async(req:Request , res:Response)=>{
    const userhandle = req.body.userhandle;
    let ans:Record<string, number> = {};
    try{
        if (!userhandle){
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = URL_gen_programingLang(userhandle);
        const info:any = await axios.get(URL);
        const user = await userModel.findOne({user_handle: userhandle});
        if(!info){
            res.status(404).json("cant find user data");
        }else{
            if(info.data.status === "OK"){
                const usercontest = info.data.result;
                //@ts-ignore
                let problems = usercontest.filter((submission: any) => submission.verdict === "OK");
                for(let submission of problems){
                    if(submission.programmingLanguage === "C++17 (GCC 7-32)" || submission.programmingLanguage === "C++20 (GCC 13-64)" || submission.programmingLanguage === "C++14 (GCC 6-32)" || submission.programmingLanguage === "C++20 (GCC 11-64)"){
                        if(!ans["c++"]){
                            ans["c++"]=1
                        }else{
                            ans["c++"]++;
                        }
                    }else{
                        if(!ans[submission.programmingLanguage]){
                            ans[submission.programmingLanguage]=1;
                        }else{
                            ans[submission.programmingLanguage]++;
                        }
                    }
                }
                let chatCompletion:string | null;
                
                if((user?.rating ?? 0) < 2000){
                    try{
                        let chat= await client.chat.completions.create({
                            messages: [
                                {
                                    "role": "system",
                                    "content": PROFILE_ANALYZER_PROMPT,
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
                    }catch(e){
                        console.log(e);
                        chatCompletion = `We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the updated analysis of Programing Language used By you.`;
                    }
                }else{
                    chatCompletion = `Wow, a Codeforces rating above ${user?.rating}? You're basically the Chuck Norris of competitive programming—solving problems faster than they can be created! You've already left the mere mortals in the dust.Now that you're flexing that algorithmic muscle, why not venture into new realms? Try out some exotic programming languages. Who knows? Maybe you'll be solving problems in Brainf**k or golfing in J with your left hand while sipping coffee with the right! Keep conquering, and remember, even geniuses need a new playground now and then!`;
                }
                const response = {
                    "data": ans,
                    "guidance": chatCompletion,
                }
                res.json(response);
            }else{
                res.status(404).json("can not find user")
            }
        }
    }catch(e){
        res.status(500).json(e);
    }
})