const mongoose = require("mongoose");

const userBlackListTokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token required for blacklist"]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BlackListToken', userBlackListTokenSchema);

