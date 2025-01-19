import { Response, Router , Request} from "express";
import { countModel, userModel } from "../db";

export const countRoute = Router();

countRoute.post("/" ,async(req:Request , res:Response)=>{
    const userhandle = req.body.user_handle;
    try{
        const existingUser = await userModel.findOne({ user_handle: userhandle });
        const countDoc = await countModel.findOne();
            
        if (existingUser){
            if(countDoc){
                await countModel.findByIdAndUpdate(countDoc._id, {
                    $inc: { count: 1 }
                });
            }
        }else{
            await userModel.create({ user_handle: userhandle });
            if(!countDoc){
                await countModel.create({ count: 1, new_count: 1 });
            }else{
                await countModel.findByIdAndUpdate(countDoc._id, {
                    $inc: { count: 1, new_count: 1 }
                });
            }
        }
    }catch(e){
        console.log(e);
    }
})