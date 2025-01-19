import axios from "axios";
import { Request, Response } from "express";
import { URL_gen_contest } from "../url_gen/url_contest";

const { Router } = require("express");

export const usercontestRoute = Router();

usercontestRoute.post("/" , async(req:Request , res:Response)=>{
    const userhandle = req.body.userhandle;
    try{
        if (!userhandle){
            res.status(400).json({ error: "User handle is required." });
        }
        const URL = URL_gen_contest(userhandle);
        const response:any =await axios.get(URL);
        if(response.data.status === "OK"){
            let ContestWrong: Record<string, any> = {};
            const ContestRight: Set<string> = new Set();

            const info = response.data.result;

            info.forEach((it:any) => {
                const pname=it.problem.name;
                if(it.verdict === "OK") {
                    ContestRight.add(pname);
                    delete ContestWrong[pname];
                }else{
                    if (!ContestRight.has(pname)) {
                        ContestWrong[pname] = {
                            tags: it.problem.tags,
                            contestId: it.problem.contestId,
                            index : it.problem.index
                        };
                    }
                }
            });
            res.json({
                wrong: ContestWrong,
            });
        }else{
            res.status(404).json("error with api")
        }
    }catch(e){
        //@ts-ignore
        res.status(500).json(e.message);
    }
})