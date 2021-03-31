const base = require('./service/base')
const userService = require('./service/userService')

exports.test = base.test;

exports.testUser = userService.testUser;