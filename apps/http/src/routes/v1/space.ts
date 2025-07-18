


import { Router } from "express";
import client from "@repo/db/client"
import { userMiddleware } from "../../middleware/user";
import { AddElementSchema,CreateSpaceSchema,DeleteElementSchema } from "../../types";
import { Request, Response } from 'express';

export const spaceRouter=Router();

//to create space
spaceRouter.post("/",userMiddleware,async(req:Request,res:Response)=>{
    const parsedData=CreateSpaceSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    try{
        if(!parsedData.data.mapId){
            const space=await client.space.create({
                data:{
                    name:parsedData.data.name,
                    width:parseInt(parsedData.data.dimensions.split("x")[0]),
                    height:parseInt(parsedData.data.dimensions.split("x")[1]),
                    creatorId:req.userId!,
                }
            })
            res.json({
                spaceId:space.id,
            })
            return;
        }
        const map=await client.map.findFirst({
            where:{
                id:parsedData.data.mapId,
            },
            select:{
                mapElements:true,
                width:true,
                height:true,
            }
        })  
        if(!map){
            res.status(400).json({
                message:"Map not found",
            })
            return;
        }
        let space = await client.$transaction(async () => {
            const space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: map.width,
                    height: map.height,
                    creatorId: req.userId!,
                }
            });
    
            type MapElementType=typeof map.mapElements[number];
            await client.spaceElements.createMany({
                data: map.mapElements.map((e:MapElementType) => ({
                    spaceId: space.id,
                    elementId: e.elementId,
                    x: e.x!,
                    y: e.y!
                }))
            })
    
            return space;
        })
            res.json({spaceId: space.id})
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
        })
    }
})


//to delete space
spaceRouter.delete("/:spaceId",userMiddleware,async(req:Request,res:Response)=>{
    try{
        const space=await client.space.findUnique({  
            where:{
                id:req.params.spaceId,
            },
            select:{
                creatorId:true,
            }   
        })
        if(!space){
            res.status(404).json({
                message:"Space not found",
            })
            return;
        }
        if(space?.creatorId!=req.userId){
            res.status(403).json({
                message:"Unauthorized",
            })
            return;
        }
        await client.space.delete({
            where:{
                id:req.params.spaceId,
            },
        })
        res.json({
            message:"Space deleted",
        })
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
        })
    }   
})

//to get all spaces

spaceRouter.get("/notCreatedByUser",userMiddleware,async(req:Request,res:Response)=>{
    try{
        const user=await client.user.findUnique({
            where:{
                id:req.userId,
            },
            select:{
                username:true,
            }
        })
        const spaces=await client.space.findMany({
            where:{
                NOT:{
                creatorId:req.userId!,
                },
            },
        })
        type SpaceType=typeof spaces[number];
        res.json({
            username:user?.username,
            spaces:spaces.map((s:SpaceType)=>({
                id:s.id,
                name:s.name,
                dimensions:`${s.width}x${s.height}`,
                thumbnail:s.thumbnail,
            }))
        })
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
        })
    }
})
spaceRouter.get("/createdByUser",userMiddleware,async(req:Request,res:Response)=>{
    try{
        const user=await client.user.findUnique({
            where:{
                id:req.userId,
            },
            select:{
                username:true,
            }
        })
        const spaces=await client.space.findMany({
            where:{
                creatorId:req.userId,
            },
        })
        type SpaceType=typeof spaces[number];
        res.json({
            username:user?.username,
            spaces:spaces.map((s:SpaceType)=>({
                id:s.id,
                name:s.name,
                dimensions:`${s.width}x${s.height}`,
                thumbnail:s.thumbnail,
            }))
        })
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
        })
    }
})
//to add element to space
spaceRouter.post("/element",userMiddleware,async(req:Request,res:Response)=>{
    const parsedData=AddElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    try{
        const space=await client.space.findUnique({
            where:{
                id:req.body.spaceId,
                creatorId:req.userId!,
            },
            select:{
                width:true,
                height:true,
            }
        })
        if(!space){
            res.status(404).json({
                message:"Space not found",
            })
            return;
        }
        await client.spaceElements.create({
            data:{
                spaceId:req.body.spaceId,
                elementId:req.body.elementId,
                x:req.body.x,
                y:req.body.y,
            }
        })
        res.json({
            message:"Element added",
        })
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
        })
    }
})

//to delete element from space
spaceRouter.delete("/element",userMiddleware,async(req:Request,res:Response)=>{
    const parsedData=DeleteElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            
        })
        return;
    }
    const spaceElement=await client.spaceElements.findFirst({
        where:{
            id:parsedData.data.id,
        },
        include:{
            space:true,
        }
    })
    if(!spaceElement?.space.creatorId||spaceElement.space.creatorId!==req.userId){
        res.status(403).json({
            message:"Unauthorized",
        })
        return;
    }
    await client.spaceElements.delete({
        where:{
            id:parsedData.data.id,
        }
    })
    res.json({
        message:"Element deleted",
    })
})

//to get space
spaceRouter.get("/:spaceId",userMiddleware,async(req:Request,res:Response)=>{
    const space=await client.space.findUnique({
        where:{
            id:req.params.spaceId,
        },
        include:{
            elements:{
                include:{
                    element:true,
                }
            }
        }
    })

    if(!space){
        res.status(404).json({
            message:"Space not found",
        })
        return;
    }
    type ElementType=typeof space.elements[number];
    res.json({
        "dimensions":`${space.width}x${space.height}`,
        elements:space.elements.map((e:ElementType)=>({
            id:e.id,
            element:{
                id:e.element.id,    
                width:e.element.width,
                height:e.element.height,
                imageUrl:e.element.imageUrl,
                static:e.element.static,
            },
            x:e.x,
            y:e.y,
        })),
    })
})