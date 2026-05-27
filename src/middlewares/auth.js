<<<<<<< HEAD
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next)=>{
    // Skip auth for OPTIONS preflight requests
    if (req.method === "OPTIONS") {
        return next();
    }

    try{
        const {token} = req.cookies;

        if(!token){
            return res.status(401).send("Unauthorized: No token provided");    
        }

        const decodedObject = await jwt.verify(token, "secretkey");

        const {id} = decodedObject;
        const user = await User.findById(id);

        if(!user){
            throw new Error("Unauthorized: Invalid token as no User found");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message: error.message});
    }
};

=======
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next)=>{
    // Skip auth for OPTIONS preflight requests
    if (req.method === "OPTIONS") {
        return next();
    }

    try{
        const {token} = req.cookies;

        if(!token){
            return res.status(401).send("Unauthorized: No token provided");    
        }

        const decodedObject = await jwt.verify(token, "secretkey");

        const {id} = decodedObject;
        const user = await User.findById(id);

        if(!user){
            throw new Error("Unauthorized: Invalid token as no User found");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message: error.message});
    }
};

>>>>>>> 6994627fba5e3789473469087eaef8907360621d
module.exports = {userAuth};