const express = require("express");

const http = require("http");

const connectDB=require("./src/config/db.js");

const authRouter = require("./src/routes/auth.js");
const profileRouter = require("./src/routes/profile.js");
const requestsRouter = require("./src/routes/requests.js");  
const userRouter = require("./src/routes/user.js");
const chatRouter = require("./src/routes/chat.js");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const initializeSocket = require("./src/utils/socket.js");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter); 
app.use("/", userRouter);
app.use("/", chatRouter);


const server = http.createServer(app);
initializeSocket(server);


connectDB().then(()=>{
    console.log("Database connected successfully...");
    server.listen(3000, ()=>{
    console.log("Server is successfully listening on port 3000...");
});
}).catch((err)=>{
    console.log("Error connecting to database: ", err);
});