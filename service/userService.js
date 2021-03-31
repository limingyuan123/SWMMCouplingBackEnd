const User = require('../model/user')
const UUID = require('node-uuid')
const Formidable = require('formidable')

exports.testUser = (req,res,next)=>{
    let form = new Formidable.IncomingForm();
    form.parse(req,(err,fields,files)=>{
        User.create()
    })
}