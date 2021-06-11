const { formidable } = require("formidable");
const request = require('request')
const Formidable = require('formidable')
exports.test = function test(req, res, next) {
    let path = req.query.path;
    res.send({
        code: 0,
        message: 'success',
        data: path
    });
    return;
}

exports.testBack = (req, res, next) => {
    let uid = req.query.uid;
    res.send({
        code: 0,
        message: 'success',
        data: 'back'
    })
}

exports.getDispVal = (req, res, next) => {
    let form = new Formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        let dispUrls = JSON.parse(fields.dispUrls);
        let dispArr = [];
        let promises = [];
        let count = 0;
        for(let key in dispUrls){
            let promise = new Promise((resolve, reject)=>{
                request(dispUrls[key], (err, response, data) => {
                    if (!err && response.statusCode === 200) {
                        console.log('suc');
                        let obj = {
                            count:response.body
                        }
                        dispArr.push(obj);                        
                        resolve(count++)
                    } else {
                        console.log('err')
                        reject(err);
                    }
                })
            })
            promises.push(promise);
        }
        Promise.all(promises).then((val)=>{
            console.log('promise all is over.');
            res.send({code:0, message:'suc', data:dispArr});
        })
        // Promise.race(promises).then((val)=>{
        //     console.log('promise race is over.');
        // })
    })
}