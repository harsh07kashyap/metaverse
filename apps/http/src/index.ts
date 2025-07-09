import express from "express";
import { router } from "./routes/v1/index";
import { spaceRouter } from "./routes/v1/space";
import { userRouter } from "./routes/v1/user";
import client from "@repo/db/client"
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
    origin: ['http://localhost:5173'], // Allow only this origin to access the server
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Allowed HTTP methods
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, auth-token', // Allowed headers
    credentials: true // If you need to send cookies or HTTP authentication
}));
app.use("/api/v1",router);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});