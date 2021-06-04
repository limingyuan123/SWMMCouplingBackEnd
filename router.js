const base = require('./service/base')
const userService = require('./service/userService')
const inp = require('./service/inp')
//测试nodejs接口
exports.test = base.test;
//测试数据库插入
exports.testUser = userService.testUser;
//测试vue跨域nodejs
exports.testBack = base.testBack;
//读取inp数据
exports.inpRead = inp.inpRead;
//读取展示数据
exports.getDispVal = base.getDispVal;