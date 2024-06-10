import express from 'express';
import {config} from 'dotenv';

config({
    path:"./data/config.env"
})
export const app = express();

//Importing Routers here

import userRoute from './routes/user.js';
app.use("/api/v1/user",userRoute)