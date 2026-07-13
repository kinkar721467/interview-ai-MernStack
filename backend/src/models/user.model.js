const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username : {
        type: String,
        unique: [true, "Username already exits"],
        required: true
    },

    email : {
        type: String,
        unique: [true, "Email already exits"],
        required: true
    },

    password: {
        type: String,
        required: true
    }
});


const userModel = mongoose.model("Users",userSchema);

module.exports = userModel;