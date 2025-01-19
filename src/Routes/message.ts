import { Response, Router , Request} from "express";
import { messageModal } from "../db";
export const messageRoute = Router();

messageRoute.post("/" ,async(req:Request , res:Response)=>{
    const message = req.body.message;
    try{
        await messageModal.create({message: message});
        res.json("message added");
    }catch(e){
        res.status(500).json(e);
    }
});