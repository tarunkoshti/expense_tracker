const mongoose = require('mongoose')

mongoose.connect("mongodb://0.0.0.0/expense")
.then(() => console.log("databae connected successfully"))
.catch((err) => console.log(err.message))