import express from 'express';
import {config} from 'dotenv';

config({
    path:"./data/config.env"
})
export const app = express();
app.use(express.json())
//Importing Routers here

import userRoute from './routes/user.js';
import { errorMiddleware } from './middlewares/error.js';
app.use("/api/v1/user",userRoute)


//Using Error middleware
app.use(errorMiddleware)