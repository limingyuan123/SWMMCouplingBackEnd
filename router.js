const base = require('./service/base')
const userService = require('./model/user')

exports.test = base.test;

exports.testUser = userService.testUser;