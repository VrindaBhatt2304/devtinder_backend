<<<<<<< HEAD
const validator = require("validator");

const validateUser = (req) => {
    const {firstName, lastName, email, password, photoURL} = req.body;
 
    if(!validator.isEmail(email)){
        throw new Error("Invalid email format");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Password not in valid format");
    }
};

const validateEditProfileData =(req,res) => {
    const allowedEditFeilds = ["firstName","lastName","email", "about", "skills", "gender", "photoURL"];
    const isEditAllowed = Object.keys(req.body).every( field => allowedEditFeilds.includes(field));
    
    return isEditAllowed;
}

const validateProfilePassword = (req) => {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
        throw new Error("User must be logged in to change password");
    }

    if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required");
    }

    if (!validator.isStrongPassword(newPassword)) {
        throw new Error("New password is not in a valid format");
    }

    return true;
};

module.exports = {
    validateSignUpData: validateUser,
    validateEditProfileData: validateEditProfileData,
    validateProfilePassword: validateProfilePassword,
=======
const validator = require("validator");

const validateUser = (req) => {
    const {firstName, lastName, email, password, photoURL} = req.body;
 
    if(!validator.isEmail(email)){
        throw new Error("Invalid email format");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Password not in valid format");
    }
};

const validateEditProfileData =(req,res) => {
    const allowedEditFeilds = ["firstName","lastName","email", "about", "skills", "gender", "photoURL"];
    const isEditAllowed = Object.keys(req.body).every( field => allowedEditFeilds.includes(field));
    
    return isEditAllowed;
}

const validateProfilePassword = (req) => {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
        throw new Error("User must be logged in to change password");
    }

    if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required");
    }

    if (!validator.isStrongPassword(newPassword)) {
        throw new Error("New password is not in a valid format");
    }

    return true;
};

module.exports = {
    validateSignUpData: validateUser,
    validateEditProfileData: validateEditProfileData,
    validateProfilePassword: validateProfilePassword,
>>>>>>> 6994627fba5e3789473469087eaef8907360621d
};