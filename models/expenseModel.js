const mongoose = require("mongoose")

const expenseModel = new mongoose.Schema({
    title: String,
    amount: Number,
    category: String,
    paymentmood: {
        type: String,
        enum:["cash","online","check"]
    },
    date:{
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, 
{
    timestamps: true
}
)

module.exports = mongoose.model('expense', expenseModel)