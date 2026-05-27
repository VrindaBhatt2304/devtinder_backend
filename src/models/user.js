const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String, 
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        trim: true,
        required: true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Invalis email address: "+ value);
            }
        },
    },
    password: {
        type: String,
        required: true, 
    },
    about: {
        type: String,
        default: "this is a default about of the user!!",
    },
    skills: {
        type: [String],
    },
    photoURL: {
        type:[String],
        default: ["https://cdn-icons-png.flaticon.com/512/149/149071.png"],
    },
    gender: {
        type: String,
        required: true,
        enum: {
            values:["Male", "Female", "Other"],  
            message: `{VALUE} is invalid`
        },
    }, 
}, {
    timestamps: true, 
});

userSchema.methods.validatePassword = async function(password){
    const user = this;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid;
};

userSchema.methods.getJWT = function(){
    const user = this;
    const token = jwt.sign({id: user._id}, "secretkey", {expiresIn: "7d"});
    return token;
};

mongoose.model("User", userSchema);
module.exports=mongoose.model("User");