const formidable = require('formidable');
const fs = require('fs');
const uuid = require('node-uuid')

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
            fs.readdir(dirPath, (err, files)=>{
                if(err) throw err;
    
                if(files.length === 0){
                    res.send({code:-1,message:'file path is empty!'});
                    return;
                }
                for(let i=0;i<files.length;i++){
                    let str = fs.readFileSync(dirPath + '/' + files[i]).toString();
                    let geojson = JSON.parse(str);
                    res.send({code:0, message:{geojson:geojson}});
                }
            })
        })
    })
}