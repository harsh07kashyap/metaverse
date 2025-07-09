import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { UpdateMetaDataSchema } from "../../types";
import client from "@repo/db/client"

export const userRouter=Router();

userRouter.post("/metadata",userMiddleware,async (req,res)=>{
    const parsedData=UpdateMetaDataSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    try{
        await client.user.update({
            where:{
                id:req.userId,
            },
            data:{
                avatarId:parsedData.data.avatarId,
            }
        })
        res.json({
            message:"Success",  
        })
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
        })
    }

})


userRouter.get("/metadata/bulk",async(req,res)=>{
    const userIdString=(req.query.ids??"[]") as string;
    const userIds=userIdString.slice(1,userIdString?.length-2).split(",");
    const metadatas=await client.user.findMany({
        where:{
            id:{
                in:userIds,
            }
        },
        select:{
            id:true,
            avatar:true,
        }
    })

    res.json({
        avatars:metadatas.map(m=>({
            userId:m.id,
            avatar:m.avatar?.imageUrl,
        })),
    })
})