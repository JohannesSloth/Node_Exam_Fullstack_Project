import express from "express";
import cors from "cors";
import userRouter from "./routers/userRouter.js"
import db from "./database/connection.js"

const app = express();

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

app.use(userRouter);


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
});
