import axios from "axios";
import OpenAI from 'openai';
import { Request, Response } from "express";
import { PROFILE_ANALYZER_PROMPT } from "../promt/promts";
import { userModel } from "../db";
import { URL_gen_accuracy } from "../url_gen/url_accuracy";
const { Router } = require("express");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const accuracyRoute = Router();

accuracyRoute.post("/" , async(req: Request , res: Response)=>{
    const userhandle = req.body.userhandle;
    try {
        if (!userhandle){
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = URL_gen_accuracy(userhandle);
        const response:any = await axios.get(URL);
        const user = await userModel.findOne({user_handle: userhandle});
        
        if (response.data.status === 'OK') {
            const info = response.data.result;
            //@ts-ignore
            const acceptedProblem = info.filter(submission =>["OK"].includes(submission.verdict));
            const topicsRight: Record<string, number> = {};
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
            const rejectedProblems = info.filter(submission =>
                ["WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR" , "MEMORY_LIMIT_EXCEEDED", "SKIPPED" , "CHALLENGED"].includes(submission.verdict)
            );
            const topicAnalysis: Record<string, number> = {};

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
            for(let right in topicsRight){
                if(right in topicAnalysis){
                    topicAnalysis[right] = topicAnalysis[right]-topicsRight[right];
                    if(topicAnalysis[right]<0){
                        delete topicAnalysis[right];
                    }
                }
            }
            let chatCompletion:any;
            if((user?.rating ?? 0) <2000){
                try{
                    let chat = await client.chat.completions.create({
                        messages: [
                            {
                                "role": "system",
                                "content": PROFILE_ANALYZER_PROMPT,
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
                    chatCompletion = chat.choices[0].message.content
                }catch{
                    chatCompletion = "We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later.";
                }
            }else{
                chatCompletion = "Hi!! You are already at a good rank, and it's natural that some of these questions might be from when you were just starting out. It’s okay to ignore them now, as they were likely harder back then but may seem easier now. Focus on advancing your skills with newer, more challenging problems instead!";
            }

            const fdata = {
                "tag_wise":topicAnalysis,
                "gpt_guide":chatCompletion
            }
            res.json(fdata);
        }else{
            res.status(404).json("error");
        }
    } catch(e) {
        res.status(500).json(e);
    }
})