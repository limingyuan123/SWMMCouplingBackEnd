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
        let dispUrls = fields.dispUrls.split(',');
        if (typeof dispUrls === 'string') {
            request(dispUrls, (err, response, data) => {
                if (!err && response.statusCode === 200) {
                    console.log('suc');
                    console.log(data);
                    let val = response.body;
                    res.send({
                        code: 0,
                        message: "success",
                        data: val
                    })

                } else {
                    console.log('err')
                    // console.log(response.statusCode);
                    res.send({
                        code: -1,
                        message: "success"
                    })
                }
            })
        } else {
            let dispArr = [];
            getDisp(dispUrls);
            // getDisp(dispUrls).then((res)=>{
            //     console.log(res)
            // }).catch((err)=>{
            //     console.log(err);
            // }).finally((res)=>{
            //     console.log(res);
            // })
            async function getDisp(dispUrls) {
                console.log(dispUrls.length);
                // await getDispFromUrl(dispUrls[0]);
                // getDispFromUrl(dispUrls[1]);
                for(let url of dispUrls){
                    await getDispFromUrl(url);
                    // let p = await getDispFromUrl(url);
                    // console.log(p);

                }
                console.log(dispArr);
                res.send({
                    code: 0,
                    message: "get disp success",
                    data: dispArr
                });
            }

            function getDispFromUrl(url) {
                request(url, (err, response, data) => {
                    if (!err && response.statusCode === 200) {
                        console.log('suc');
                        dispArr.push(response.body);
                        return;
                        // resolve(statusCode) ;
                    } else {
                        console.log('err')
                        // console.log(response.statusCode);
                        res.send({
                            code: -1,
                            message: "success"
                        })
                        reject(err);
                        return;
                    }
                })
                // return new Promise((resolve, reject)=>{
                //     setTimeout(()=> {
                //         console.log(1)
                //     }, 1000);
                //     // request(url, (err, response, data)=>{
                //     //     if(!err && response.statusCode === 200){
                //     //         console.log('suc');
                //     //         dispArr.push(response.body);
                //     //         return;
                //     //         // resolve(statusCode) ;
                //     //     }else{
                //     //         console.log('err')
                //     //         // console.log(response.statusCode);
                //     //         res.send({code:-1, message:"success"})
                //     //         reject(err);
                //     //         return;
                //     //     }
                //     // })
                // })
            }
        }

        // for(let i=0;i<dispUrls.length;i++){
        //     getDispFromUrl(dispUrls[i]);
        // }
        // .on("close", res.send({code:0, message:"success", data:dispArr}));

    })
}