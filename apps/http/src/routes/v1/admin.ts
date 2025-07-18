
import { Router } from "express";
import client from "@repo/db/client";
import { adminMiddleware } from "../../middleware/admin";
import { AddElementSchema, CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import { Request, Response } from 'express';
export const adminRouter=Router();
adminRouter.use(adminMiddleware)


adminRouter.post("/element",adminMiddleware,async(req:Request,res:Response)=>{
    const parsedData=CreateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    const element=await client.element.create({
        data:{
            imageUrl:parsedData.data.imageUrl,
            width:parsedData.data.width,
            height:parsedData.data.height,
            static:parsedData.data.static,
        }
    })
    res.json({
        id:element.id,
    })
})

adminRouter.put("/element/:elementId",adminMiddleware,async(req:Request,res:Response)=>{
    const parsedData=UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    await client.element.update({
        where:{
            id:req.params.elementId,
        },
        data:{
            imageUrl:parsedData.data.imageUrl,
        }
    })
    res.json({
        message:"Element updated",
    })

})

adminRouter.post("/avatar",adminMiddleware,async(req:Request,res:Response)=>{
    const parsedData=CreateAvatarSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    const avatar=await client.avatar.create({
        data:{
            imageUrl:parsedData.data.imageUrl,
            name:parsedData.data.name,
        }
    })
    res.json({
        id:avatar.id,
    })
})

adminRouter.post("/map",adminMiddleware,async(req:Request,res:Response)=>{
    const parsedData=CreateMapSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    const map=await client.map.create({
        data:{
            thumbnail:parsedData.data.thumbnail,
            width:parseInt(parsedData.data.dimensions.split("x")[0]),
            height:parseInt(parsedData.data.dimensions.split("x")[1]),
            name:parsedData.data.name,
            mapElements:{
                create:parsedData.data.defaultElements.map(e=>({
                    elementId:e.elementId,
                    x:e.x,
                    y:e.y,
                }))
            }
        }
    })
    res.json({
        id:map.id,
    })
})