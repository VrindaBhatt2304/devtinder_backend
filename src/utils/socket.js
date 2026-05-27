const socket = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const generateRoomId = (userId, targetUserId) => {
  return crypto.createHash("sha256").update([userId, targetUserId].sort().join("-")).digest("hex");
};

const verifySocketToken = (token) => {
  try {
    if (!token) return null;
    const decodedObject = jwt.verify(token, "secretkey");
    return decodedObject.id;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

const validateConnection = async (userId, targetUserId) => {
  try {
    // Prevent user from chatting with themselves
    if (userId.toString() === targetUserId.toString()) {
      console.log(`Validation failed: User cannot chat with themselves`);
      return false;
    }

    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
        { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
      ],
    });

    console.log(`Connection check between ${userId} and ${targetUserId}: ${connection ? "VALID" : "INVALID"}`);
    return connection !== null;
  } catch (error) {
    console.error("Error validating connection:", error);
    return false;
  }
};

const initalizeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ userId, targetUserId }) => {
      try {
        console.log(`joinRoom attempt: userId=${userId}, targetUserId=${targetUserId}`);

        // Get token from handshake auth
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];
        const authenticatedUserId = verifySocketToken(token);

        console.log(`Token verification: authenticatedUserId=${authenticatedUserId}`);

        // Verify user is authenticated and userId matches
        if (!authenticatedUserId || authenticatedUserId.toString() !== userId.toString()) {
          console.log("Auth failed: token mismatch or missing");
          socket.emit("error", {
            message: "Unauthorized: Invalid or missing authentication",
          });
          return;
        }

        // Verify connection exists
        const isConnected = await validateConnection(userId, targetUserId);
        if (!isConnected) {
          console.log("Connection validation failed");
          socket.emit("error", {
            message: "Unauthorized: No active connection with this user",
          });
          return;
        }

        const room = generateRoomId(userId, targetUserId);
        socket.join(room);
        console.log(`Socket joined room: ${room}`);
        socket.emit("joinedRoom", { success: true, room });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    socket.on("sendMessage", async ({ userId, targetUserId, firstName, lastName, text }) => {
      try {
        console.log(`sendMessage attempt: userId=${userId}, targetUserId=${targetUserId}`);

        // Get token from handshake auth
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];
        const authenticatedUserId = verifySocketToken(token);

        console.log(`Token verification: authenticatedUserId=${authenticatedUserId}`);

        // Verify user is authenticated and userId matches
        if (!authenticatedUserId || authenticatedUserId.toString() !== userId.toString()) {
          console.log("Auth failed: token mismatch or missing");
          socket.emit("error", {
            message: "Unauthorized: Invalid or missing authentication",
          });
          return;
        }

        // Verify connection exists
        const isConnected = await validateConnection(userId, targetUserId);
        if (!isConnected) {
          console.log("Connection validation failed");
          socket.emit("error", {
            message: "Unauthorized: No active connection with this user",
          });
          return;
        }

        const room = generateRoomId(userId, targetUserId);
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({ senderId: userId, text });
        await chat.save();

        console.log(`Message saved and emitted to room: ${room}`);
        io.to(room).emit("received Message", {
          senderId: userId,
          firstName,
          lastName,
          text,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving message to database:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initalizeSocket;