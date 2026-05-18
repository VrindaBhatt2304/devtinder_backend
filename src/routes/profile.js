const express = require("express");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();
const { validateEditProfileData: validateProfileUpdateData, validateProfilePassword } = require("../utils/validation.js");
const {userAuth} = require("../middlewares/auth.js"); 

profileRouter.use((req,res,next)=>{
    next();
})

profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try{
        const user= req.user;
        res.send(user);
    }
    catch(err){
        console.log("Error in profile route: ", err);
        res.status(500).json({message: "Internal server error"});
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res)=>{
     try{
        if(!validateProfileUpdateData(req)){
            throw new Error("Invalid data for profile update");
            return res.status(400).send("Invalid data for profile update");
        }

        const user = req.user;
        console.log("Updating profile for user: ", user);
        Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
        await user.save();
        console.log("Profile updated successfully for user: ", user);
        res.json({
            message: `${user.firstName}, your profile updated successfully`,
            data: user,
        });
     }
     catch(err)
     {
        res.status(400).send("Error : "+ err.message);
     }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        validateProfilePassword(req);

        const user = req.user;
        const { oldPassword, newPassword } = req.body;

        const isOldPasswordValid = await user.validatePassword(oldPassword);
        if (!isOldPasswordValid) {
            throw new Error("Old password is incorrect");
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.password = passwordHash;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = profileRouter;