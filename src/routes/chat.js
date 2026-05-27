const express = require('express');
const { Chat } = require('../models/chat');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');

const chatRouter = express.Router();

// Validate if two users are connected
const validateConnection = async (userId, targetUserId) => {
  try {
    if (userId.toString() === targetUserId.toString()) {
      return false;
    }

    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
        { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
      ],
    });

    return connection !== null;
  } catch (error) {
    console.error("Error validating connection:", error);
    return false;
  }
};

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req?.user?._id;
    
    try {
        // Validate that users are connected
        const isConnected = await validateConnection(userId, targetUserId);
        if (!isConnected) {
            return res.status(403).json({ 
                error: "Unauthorized: No active connection with this user" 
            });
        }

        let chat = await Chat.findOne({ 
            participants: { $all: [userId, targetUserId] } 
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName",
        });
        
        if(!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
          await chat.save();
        }
        
        res.json(chat);
    } catch(err) {
        console.error("Chat retrieval error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = chatRouter;