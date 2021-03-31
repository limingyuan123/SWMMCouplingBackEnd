exports.test = function test(req,res,next){
    let path = req.query.path;
    res.send({code:0,message:'success',data:path});
    return;
}