import dotenv from 'dotenv';
import express from "express";
import cors from 'cors'
dotenv.config();

import { userinfoRoute } from "./Routes/user";
import { userratingRoute } from "./Routes/raiting";
import { usercontestRoute } from "./Routes/contest";
import { programinglangRoute } from "./Routes/programinglang";
import { accuracyRoute } from "./Routes/accuracy";
import { countRoute } from "./Routes/count";
import { VerdictRoute } from "./Routes/verdict";
import {messageRoute} from "./Routes/message";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/message", messageRoute);
app.use("/api/v1/userinfo", userinfoRoute);
app.use("/api/v1/rating", userratingRoute);
app.use("/api/v1/contest", usercontestRoute);
app.use("/api/v1/programming-lang", programinglangRoute);
app.use("/api/v1/accuracy", accuracyRoute);
app.use("/api/v1/verdict", VerdictRoute);


app.use("/api/v1/count", countRoute);


app.listen(3001);