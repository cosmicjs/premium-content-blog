console.log(process.env)
const config = require('./' + process.env.NODE_ENV)
module.exports = config
