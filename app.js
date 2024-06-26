import express from 'express';
import {config} from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'
config({
    path:"./data/config.env"
})
export const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))
//Importing Routers here

import userRoute from './routes/user.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/order.js';
import { errorMiddleware } from './middlewares/error.js';
app.use("/api/v1/user",userRoute)
app.use("/api/v1/product",productRoute)
app.use("/api/v1/order",orderRoute)


//Using Error middleware
app.use(errorMiddleware)