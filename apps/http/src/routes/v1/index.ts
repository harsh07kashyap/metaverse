
import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { SignupSchema,SigninSchema } from "../../types";
export const router=Router();
import { hash,compare } from "../../scrypt";
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../../config";
import client from "@repo/db/client"


// import  { Request, Response } from 'express';
import type { Request, Response } from 'express-serve-static-core';



router.post("/signup",async (req:Request,res:Response)=>{
    console.log("Received data:", req.body);
    const parsedData=SignupSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"Validation failed",
            success:false,
        })
        return;
    }
    const hashedPassword=await hash(parsedData.data.password);
    try{
        const user=await client.user.create({
            data:{
                username:parsedData.data.username,
                password:hashedPassword,
                role:parsedData.data.type==="admin"?"Admin":"User",
            }
        })
        // Generate a token after creating the user
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_PASSWORD
        );
    
        res.json({
            userId: user.id,
            token, // Include the token in the response
            success:true,
        });
    }catch(e){
        res.status(400).json({
            message:"User already exists",
            success:false,
        })
    }
})


router.post("/signin",async(req:Request,res:Response)=>{
    console.log("Received data:", req.body);
    const parsedData=SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({
            message:"Validation failed",
            success:false,
        })
        return;
    }
    try{
        const user=await client.user.findUnique({
            where:{
                username:parsedData.data.username,
            }
        })
        if(!user){
            res.status(403).json({
                message:"User not found",
                success:false
            })
            return;
        }
        const isValid=await compare(parsedData.data.password,user.password)
        if(!isValid){
            res.status(403).json({
                message:"Invalid password",
                success:false
            })
            return;
        }
        const token=jwt.sign({
            userId:user.id,
            role:user.role,
        },JWT_PASSWORD);
        res.json({
            token,
            success:true
        })
    }catch(e){
        res.status(400).json({
            message:"Internal server error",
            success:false
        })
    }
})




router.get("/elements",async (req:Request,res:Response)=>{
    const elements=await client.element.findMany();
    type ElementType=typeof elements[number];
    res.json({
        elements:elements.map((e:ElementType)=>({
            id:e.id,
            width:e.width,
            height:e.height,
            imageUrl:e.imageUrl,
            static:e.static,
        }))
    })
})


router.get("/avatars",async(req:Request,res:Response)=>{
    const avatars=await client.avatar.findMany();
    type AvatarType=typeof avatars[number];
    res.json({
        avatars:avatars.map((a:AvatarType)=>({
            id:a.id,
            name:a.name,
            imageUrl:a.imageUrl,
        }))
    })
})


router.use("/user",userRouter);
router.use("/space",spaceRouter);
router.use("/admin",adminRouter);
