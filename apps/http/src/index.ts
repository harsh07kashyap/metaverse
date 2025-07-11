import express from "express";
import { router } from "./routes/v1/index";
import dotenv from "dotenv";

import client from "@repo/db/client"
import cors from "cors"
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Allowed HTTP methods
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, auth-token', // Allowed headers
    credentials: true // If you need to send cookies or HTTP authentication
}));
app.use("/api/v1",router);

app.listen(3000, () => {
    console.log(`Server is running on ${process.env.FRONTEND_URL}` );
});