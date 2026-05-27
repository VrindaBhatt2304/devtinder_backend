const mongoose = require("mongoose");

const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://vrindabhatt02_db_user:FHTwFn7CymHbkvgT@cluster0.nz3nbls.mongodb.net/?appName=Cluster0/DevTinder"
);
};

module.exports=connectDB;