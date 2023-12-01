const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

const userModel = new mongoose.Schema(
    {
        email: String,
        username: String,
        password: String,
        resetPasswordOtp: {
            type: Number,
            default: -1,
        },
        expenses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'expense'
            }
        ]
    },
    {
        timestamps: true
    }
)

userModel.plugin(plm)

module.exports = mongoose.model('user',userModel)
