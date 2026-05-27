<<<<<<< HEAD
const express= require('express');
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation.js");
const User =require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res)=>{
  try{
      validateSignUpData(req);

      const { firstName, lastName, email, password, gender, skills, about } = req.body;

      const passwordHash = await bcrypt.hash(password, 10);

      const filteredPhotoURL = Array.isArray(req.body.photoURL)
        ? req.body.photoURL.map((url) => url?.trim()).filter((url) => url)
        : undefined;

      const user = new User({
          firstName,
          lastName,
          email,
          password: passwordHash,
          gender,
          skills,
          about: about?.trim(),
          photoURL: filteredPhotoURL && filteredPhotoURL.length > 0 ? filteredPhotoURL : undefined,
      });
        await user.save();
        res.status(201).json({message: "User registered successfully"});
  }
  catch(err){
    console.log("Error in signup route: ", err);
    res.status(500).json({message: "Internal server error"});
  }  
});

authRouter.post("/login", async (req, res)=>{
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email: email});
        if(!user){
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid)
        {
            const token = await user.getJWT();

            res.cookie("token", token, {
                expires: new Date(Date.now() + 7*24*60*60*1000),
            });
            res.send(user);
        }
        else{
            throw new Error("Invalid email or password");
        }
    }
    catch(err){
        console.log("Error in login route: ", err);
        res.status(401).json({message: "Invalid email or password"});
    }
});

authRouter.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.send("Logout successful");
});


=======
const express= require('express');
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation.js");
const User =require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res)=>{
  try{
      validateSignUpData(req);

      const { firstName, lastName, email, password, gender, skills, about } = req.body;

      const passwordHash = await bcrypt.hash(password, 10);

      const filteredPhotoURL = Array.isArray(req.body.photoURL)
        ? req.body.photoURL.map((url) => url?.trim()).filter((url) => url)
        : undefined;

      const user = new User({
          firstName,
          lastName,
          email,
          password: passwordHash,
          gender,
          skills,
          about: about?.trim(),
          photoURL: filteredPhotoURL && filteredPhotoURL.length > 0 ? filteredPhotoURL : undefined,
      });
        await user.save();
        res.status(201).json({message: "User registered successfully"});
  }
  catch(err){
    console.log("Error in signup route: ", err);
    res.status(500).json({message: "Internal server error"});
  }  
});

authRouter.post("/login", async (req, res)=>{
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email: email});
        if(!user){
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid)
        {
            const token = await user.getJWT();

            res.cookie("token", token, {
                expires: new Date(Date.now() + 7*24*60*60*1000),
            });
            res.send(user);
        }
        else{
            throw new Error("Invalid email or password");
        }
    }
    catch(err){
        console.log("Error in login route: ", err);
        res.status(401).json({message: "Invalid email or password"});
    }
});

authRouter.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.send("Logout successful");
});


>>>>>>> 6994627fba5e3789473469087eaef8907360621d
module.exports=authRouter;