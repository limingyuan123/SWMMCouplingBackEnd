const mongoose = require('../lib/mongodb')
const DB = require('../config/config')

let dataSchema = new mongoose.mongoose.Schema({
    uid:String,
    name:String,
    email:String,
    password:String
},{
    versionKey:false,
    collection:'user'
})

let user = DB.db.model('user', dataSchema);
exports.User = user;