const config = require('../config/config')
const mongoose = require('mongoose')

//连接数据库
let db = mongoose.createConnection(config.db, {useNewUrlParser:true, useUnifiedTopology:true})
db.on('error',console.error.bind(console,'db connect failed!'))
db.once('open', ()=>{
    console.log('db connect success!')
})

exports.mongoose = mongoose;
exports.DB = db;