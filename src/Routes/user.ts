import axios from "axios";
import OpenAI from 'openai';
import { Request, Response } from "express";
import { countModel, userModel } from "../db";
import { PROFILE_ANALYZER_PROMPT } from "../promt/promts";
import { URL_gen_userinfo } from "../url_gen/url_userinfo";
const { Router } = require("express");

export const userinfoRoute = Router();


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

userinfoRoute.post('/', async(req: Request, res: Response)=>{
    try{
        const userhandle = req.body.userhandle;
        if (!userhandle){
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = URL_gen_userinfo(userhandle);
        const response:any = await axios.get(URL);

        if(response.data.status === 'OK'){

        try{
            const existingUser = await userModel.findOne({ 
                user_handle: userhandle
            });

            const countDoc = await countModel.findOne();
    
            if (existingUser) {
                if(countDoc){
                    await countModel.findByIdAndUpdate(countDoc._id, {
                        $inc: { count: 1 }
                    });
                }
            }else{
                await userModel.create({ user_handle: userhandle , rating: response.data.result[0].rating });
                if(!countDoc){
                    await countModel.create({ count: 1, new_count: 1 });
                }else{
                    await countModel.findByIdAndUpdate(countDoc._id, {
                        $inc: { count: 1, new_count: 1 }
                    });
                }
            }

        }catch(dbError){
            return res.status(500).json({ error: "Database operation failed" });
        }

        try {
            const data = response.data.result;
            let summary: string | null;
            try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const chatCompletion = await client.chat.completions.create({
                        messages: [
                            {
                                "role": "system",
                                "content": PROFILE_ANALYZER_PROMPT,
                            },
                            {
                                role: 'user',
                                content: `Write a short summary about me from the following Codeforces account information of myself: ${JSON.stringify(data)}.`,
                            },
                        ],
                        model: "gpt-4o-mini-2024-07-18",
                        temperature: 0.5,
                        max_tokens: 1500,
                        top_p: 1,
                    });
                    summary = chatCompletion.choices[0].message.content;


            } catch (openAIError) {
                    console.error('OpenAI API Error (summary):', openAIError);
                    summary = "Error generating summary with OpenAI.";
            }

            let improvementSuggestion:string | null = "No additional information requested.";
            if(data[0].rating < 2100){
                try {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const chat = await client.chat.completions.create({
                            messages: [
                                {
                                    "role": "system",
                                    "content": PROFILE_ANALYZER_PROMPT,
                                },
                                {
                                    role: 'user',
                                    content: `Tell me how I can improve my rating as my current rating is ${data[0].rating} in codeforces compatitive programing and my current rank is ${data[0].rank}. (Write all suggestions with more topics to solve in order to increase my rank to next rank in one paragraph and reply in second person write maximum of 4-5 points).`,
                                },
                            ],
                            model: "gpt-4o-mini-2024-07-18",
                            temperature: 0.5,
                            max_tokens: 1500,
                            top_p: 1,
                        });
                        improvementSuggestion = chat.choices[0].message.content;


                }catch(openAIError){
                        improvementSuggestion = `We apologize ${userhandle} for the inconvenience. Due to high traffic on the site, the limit for your API key has been reached. Please try again later to receive the updated analysis of your profile.`;
                }
            }else{
                    improvementSuggestion = `With a max rating of ${data[0].maxRating} , you are are already a ${data[0].maxRank}, focus on improving speed by practicing quick problem selection and optimizing your coding templates. Regularly simulate contests to work on reducing typo errors under time pressure.`
            }

            const result = {
                "user_info": data,
                "summary": summary,
                "rating_improvement": improvementSuggestion,
            };

            res.json(result);
        }catch(axiosError){
            console.error('Codeforces API Error:', axiosError);
            res.status(500).json({ error: "Error fetching data from Codeforces API." });
        }
    }else{
            res.status(400).json({ error: "Invalid response from Codeforces API." });
        }
    } catch (e) {
        console.error('Internal Server Error:', e);
        res.status(500).json({ error: "Internal server error." });
    }
})