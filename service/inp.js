const cp = require("child_process"); //引入包
const formidable = require('formidable')
const fs = require('fs')
const uuid = require('node-uuid')
const utils = require('../utils/utils')
const config = require('../config/config')

exports.inpRead  = (req, res, next)=>{
    let form = new formidable.IncomingForm({maxFileSize:6*1024 * 1024 * 1024});
    let uid = uuid.v4();
    let dirPath = __dirname + '/../uploadINP/' + uid;
    fs.mkdir(dirPath,{recursive:true}, (err)=>{
        if(err){
            res.send({code:-1, message:'error'});
            throw err
        }
        form.uploadDir = dirPath;
        form.keepExtensions = true;

        form.parse(req, (err, fields, file)=>{
            console.log(dirPath);
            this.operationInp(dirPath, res);
            // console.log(res);
            // res.send({code:0, message:{geojson:geojson}});
            // fs.readdir(dirPath, (err, files)=>{
            //     if(err) throw err;
    
            //     if(files.length === 0){
            //         res.send({code:-1,message:'file path is empty!'});
            //         return;
            //     }
            //     let geojson;
            //     for(let i=0;i<files.length;i++){
            //         let str = fs.readFileSync(dirPath + '/' + files[i]).toString();
            //         geojson = JSON.parse(str);
            //     }
            //     //删除文件
            //     utils.DelFile(dirPath,dirPath);
            //     //设置res            
            //     res.send({code:0, message:{geojson:geojson}});
            // })
        })
    })
}

exports.operationInp = function(dirPath, res){
    fs.readdir(dirPath, (err, files)=>{
        if(err) throw err;

        if(files.length === 0){
            res.send({code:-1,message:'file path is empty!'});
            return;
        }


        let inpPath = dirPath + '/' + files[0];
        let shpOutPath = dirPath + '/out1';
        fs.mkdir(shpOutPath,(err)=>{
            if(err) throw err;
        })
        //调用python脚本，处理inp
        //inp2shp
        let par1 = [config.inpToShpPath, inpPath, shpOutPath];
        const inp2shp = cp.spawn(config.pythonExePath, par1);//python安装路径，inp路径，shp输出路径
        inp2shp.on('exit', (code1) => {
            console.log(`inp2shp进程使用代码 ${code1} 退出`);
            if(code1!=0){
                let msg={code:-1,message:'inp operation err!1'}
                res.end(JSON.stringify(msg));
                return
            }else{
                //shp2geojson
                fs.readdir(shpOutPath, (err, files)=>{
                    if(err) throw err;

                    if(files.length === 0){
                        res.send({code:-1,message:'inp operation err!2'});
                        return;
                    }
                    let shpPath, geojsonPath, out2Path, out3Path;
                    out2Path = shpOutPath + '/out2/';
                    out3Path = out2Path + '/out3/';
                    
                    // fs.mkdir(out2Path,(err)=>{
                    //     if(err) throw err;
                    // })
                    fs.mkdir(out3Path,{recursive:true},(err)=>{
                        if(err) throw err;
                    })

                    let par2,par3;
                    shpToGeojson()
                    .then(geoTrans)
                    // .then(mergeJson)
                    .then((path)=>{
                        //setTimeout设置对setInterval的超时清除
                        const intervalObj = setInterval(()=>{
                            fs.readdir(path, (err, files) => {
                                if(files.length === 4){
                                    console.log(intervalObj);
                                    clearInterval(intervalObj);
                                    fs.readdir(path, (err,files)=>{
                                        if(err) throw err;
            
                                        if(files.length === 0){
                                            res.send({code:-1,message:'inp operation err!4'});
                                            return;
                                        }
                                        let str = '',geojson;
                                        let resJSONObj = [];
                                        for(let i=0;i<files.length;i++){
                                            str = fs.readFileSync(out3Path+files[i]).toString();
                                            geojson = JSON.parse(str);
                                            resJSONObj = resJSONObj.concat(geojson.features);
                                        }
                                        console.log('suc');
                                        //将数据传回前台
                                        let obj = {
                                            "type": "FeatureCollection",
                                            "features":undefined
                                        };
                                        obj.features = resJSONObj;
                                        res.send({code:0, message:'suc', data:obj});
                                        return;
                                        // resolve(resJSONObj);
                                    })
                                }
                              });
                        }, 500);
                        // intervalObj();

                        setTimeout(()=>{
                            clearInterval(intervalObj);
                            res.send({code:-1,message:'merge json timeout!'});
                        }, 10000)


                        // fs.readdir(path, (err,files)=>{
                        //     if(err) throw err;

                        //     if(files.length === 0){
                        //         res.send({code:-1,message:'inp operation err!4'});
                        //         return;
                        //     }
                        //     let str = '',geojson;
                        //     let resJSONObj = [];
                        //     for(let i=0;i<files.length;i++){
                        //         str = fs.readFileSync(out3Path+files[i]).toString();
                        //         geojson = JSON.parse(str);
                        //         resJSONObj = resJSONObj.concat(geojson.features);
                        //     }
                        //     console.log('suc');
                        //     //将数据传回前台
                        //     let obj = {
                        //         "type": "FeatureCollection",
                        //         "features":undefined
                        //     };
                        //     obj.features = resJSONObj;
                        //     res.send({code:0, message:'suc', data:obj});
                        //     return;
                        //     // resolve(resJSONObj);                                
                        // })
                        
                    })
                    .catch(err=>{
                        console.log('caught message!', err.message)
                    })

                    function shpToGeojson(){
                        console.log('shpToGeojson');
                        let promise1 = new Promise((resolve, reject)=>{
                            for(let i=0;i<files.length;i++){
                                //匹配shp，循环调用转换函数
                                let fileName = files[i].split('.');
                                if(fileName[1] === "shp"){
                                    shpPath = shpOutPath + '/' + files[i];
                                    geojsonPath = out2Path + fileName[0] + '.json';
                                    par2 = [config.shpToGeoJSONPath, shpPath, geojsonPath, "ShpToGeoJSON"];
                                    let shp2geojson = cp.spawn(config.pythonExePath, par2);
                                    shp2geojson.on('exit', (code2) =>{
                                        console.log(`shp2geojson进程使用代码 ${code2} 退出`);
                                        if(code2!=0){
                                            let msg={code:-1,message:'inp operation err!2'}
                                            res.end(JSON.stringify(msg));
                                            return
                                        }
                                        resolve(out2Path);
                                    })
                                }
                            }
                        })
                        return promise1;
                    }
                    function geoTrans(path){
                        console.log('geoTrans');
                        console.log(path);
                        let promise2 = new Promise((resolve, reject)=>{
                            fs.readdir(out2Path,(err, files)=>{
                                if(err) throw err;
    
                                if(files.length === 0){
                                    res.send({code:-1,message:'inp operation err!3'});
                                    return;
                                }
                                let fileName;
                                for(let i=0;i<files.length;i++){
                                    fileName = files[i].split('.');
                                    //===2筛掉文件夹
                                    if(fileName.length === 2){
                                        geojsonPath = out2Path + fileName[0] + '.json';
                                        // geojson投影坐标转经纬度坐标
                                        let newGeojsonPath = out3Path + 'new' + fileName[0] + '.json'
                                        par3 = [config.geojsonTransPath, geojsonPath, newGeojsonPath];
                                        let geojsonTrans = cp.spawn(config.pythonExePath, par3);
                                        geojsonTrans.on('exit', (code3)=>{
                                            console.log(`geojsonTrans进程使用代码 ${code3} 退出`);
                                            if(code3!=0){
                                                let msg={code:-1,message:'inp operation err!3'}
                                                res.send(JSON.stringify(msg));
                                                return
                                            }      
                                            resolve(out3Path);
                                        })  
                                    }
                                }
                            })  
                        })
                        return promise2;
                    }
                    // function mergeJson(path){
                    //     console.log('mergeJson');
                    //     console.log(path);
                    //     let promise3 = new Promise((resolve, reject)=>{
                    //         fs.readdir(out3Path, (err,files)=>{
                    //             if(err) throw err;
    
                    //             if(files.length === 0){
                    //                 res.send({code:-1,message:'inp operation err!4'});
                    //                 return;
                    //             }
                    //             let str = '',geojson;
                    //             let resJSONObj = [];
                    //             for(let i=0;i<files.length;i++){
                    //                 str = fs.readFileSync(out3Path+files[i]).toString();
                    //                 geojson = JSON.parse(str);
                    //                 resJSONObj = resJSONObj.concat(geojson.features);
                    //             }
                    //             resolve(resJSONObj);                                
                    //         })
                    //     })
                    //     return promise3;
                    // }

                    // let promise = new Promise(function(resolve, reject){
                    //     resolve();
                    // })
                    // promise.then(()=>{
                    //     //shp转geojson
                    //     for(let i=0;i<files.length;i++){
                    //         //匹配shp，循环调用转换函数
                    //         let fileName = files[i].split('.');
                    //         if(fileName[1] === "shp"){
                    //             shpPath = shpOutPath + '/' + files[i];
                    //             geojsonPath = out2Path + fileName[0] + '.json';
                    //             par2 = [config.shpToGeoJSONPath, shpPath, geojsonPath, "ShpToGeoJSON"];
                    //             let shp2geojson = cp.spawn(config.pythonExePath, par2);
                    //             shp2geojson.on('exit', (code2) =>{
                    //                 console.log(`shp2geojson进程使用代码 ${code2} 退出`);
                    //                 if(code2!=0){
                    //                     let msg={code:-1,message:'inp operation err!2'}
                    //                     res.end(JSON.stringify(msg));
                    //                     return
                    //                 }
                    //             })
                    //         }
                    //     }
                    // })
                    //投影转换
                    // .then(()=>{
                    //     fs.readdir(out2Path,(err, files)=>{
                    //         if(err) throw err;

                    //         if(files.length === 0){
                    //             res.send({code:-1,message:'inp operation err!3'});
                    //             return;
                    //         }
                    //         let fileName;
                    //         for(let i=0;i<files.length;i++){
                    //             fileName = files[i].split('.');
                    //             //===2筛掉文件夹
                    //             if(fileName.length === 2){
                    //                 geojsonPath = out2Path + fileName[0] + '.json';
                    //                 // geojson投影坐标转经纬度坐标
                    //                 let newGeojsonPath = out3Path + 'new' + fileName[0] + '.json'
                    //                 par3 = [config.geojsonTransPath, geojsonPath, newGeojsonPath];
                    //                 let geojsonTrans = cp.spawn(config.pythonExePath, par3);
                    //                 geojsonTrans.on('exit', (code3)=>{
                    //                     console.log(`geojsonTrans进程使用代码 ${code3} 退出`);
                    //                     if(code3!=0){
                    //                         let msg={code:-1,message:'inp operation err!3'}
                    //                         res.send(JSON.stringify(msg));
                    //                         return
                    //                     }                                        
                    //                 })  
                    //             }
                    //         }
                    //     })  
                    // })
                    //组合json串
                    // .then(()=>{
                    //     fs.readdir(out3Path, (err,files)=>{
                    //         if(err) throw err;

                    //         if(files.length === 0){
                    //             res.send({code:-1,message:'inp operation err!4'});
                    //             return;
                    //         }
                    //         let str = '',geojson;
                    //         let resJSONObj = [];
                    //         for(let i=0;i<files.length;i++){
                    //             str = fs.readFileSync(out3Path+files[i]).toString();
                    //             geojson = JSON.parse(str);
                    //             resJSONObj = resJSONObj.concat(geojson.features);
                    //         }
                            
                    //     })
                    // })


        })
            }

        })
        

    })

}