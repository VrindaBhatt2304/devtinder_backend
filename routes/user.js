const express = require("express");
const userRouter = express.Router();
const User = require("../models/user.js");
const {userAuth} = require("../middlewares/auth.js");   
const ConnectionRequest = require("../models/connectionRequest.js");

const USER_SAVE_DATA = ["firstName", "lastName", "gender", "skills", "photoURL", "about"];
 
userRouter.get("/user/requests/received", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", USER_SAVE_DATA);


        res.json({message: "Connection requests received", data: connectionRequests});
    }
    catch(err)
    {
        res.status(500).send({message: "Internal server error"});
    }
 });

userRouter.get("/user/connections", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"},
            ],
        }).populate("fromUserId", USER_SAVE_DATA).populate("toUserId", USER_SAVE_DATA);

        const data = connectionRequest.map((row) => {
            if(row.fromUserId._id.equals(loggedInUser._id)){
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({data});
    }
    catch(err)
    {
        res.status(500).send({message: "Internal server error"});
    }
});

userRouter.get("/user/feed", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit>50 ? 50 : limit;
        const skip = (page-1)*limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {toUserId: loggedInUser._id},
                {fromUserId: loggedInUser._id},
            ],
        }).select("toUserId fromUserId");

        const hideUserFromFeed = new Set();

        connectionRequests.forEach((req) =>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
           $and: 
            [
                {_id: {$nin: Array.from(hideUserFromFeed) }},
                {_id: {$ne: loggedInUser._id}},
            ],
        }).select(USER_SAVE_DATA).skip(skip).limit(limit);

        res.send(users);
    }
    catch(err)
    {
        res.status(500).send({message: "Internal server error"});
    }
});

module.exports = userRouter;