const User = require('../model/user').User;
const UUID = require('node-uuid')
const Formidable = require('formidable')

exports.testUser = (req,res,next)=>{
    let form = new Formidable.IncomingForm();
    form.parse(req,(err,fields,files)=>{
        let usr = {
            uid:fields.uid,
            name:fields.name,
            password:fields.password,//最好加密一下
            email:fields.email
        }
        User.create(usr,(err)=>{
            if(err){
                res.send({code:-1,message:'register user failed!'});
                return;
            }else{
                res.send({code:0,message:'sucess!'})
            }
            
        })
    })
}