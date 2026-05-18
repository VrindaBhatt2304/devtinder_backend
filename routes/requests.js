const express = require("express");
const requestsRouter = express.Router();
const {userAuth} = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js")

requestsRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"];
       
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status type"});
        }

        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({message: "User not found"});
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ],
        });

        if(existingRequest){
            return res.status(400).send({message: "Connection request already exists"});
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const data = await connectionRequest.save();

        res.json({
            message: req.user.firstName + ", is " + status + " " + toUser.firstName,
            data,
        });
    }
    catch(err){
        console.log("Error in requests route: ", err);
        res.status(500).send({message: "Internal server error"});
    }   
});

requestsRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const {status, requestId} = req.params;
        
        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json(
            {message: "Invalid status type"});
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status : "interested",
        });
        if(!connectionRequest){
            return res.status(404).json({message: "Connection request not found"});
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({message: "Connection request " + status, data,});
    }
    catch(err)
    {
        res.status(500).send({message: "Internal server error"});
    }
});

module.exports=requestsRouter;