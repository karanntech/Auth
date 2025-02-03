import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import router from "./routes/authRoutes.js";


const app = express();
const port = process.env.PORT

connectDB()

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

//API endpoints
app.use('/auth', router)


app.listen(port, ()=> console.log(`Server started on PORT:${port}`))