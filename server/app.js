import express from "express";
import cors from "cors";
import userRouter from "./routers/userRouter.js"
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();

const app = express();

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );
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
