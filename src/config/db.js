const dotenv = require('dotenv')
const data = dotenv.config()

if (data.error) {
  throw data.error
}
const env = data.parsed


module.exports = {
    mongodbAddress: env.DB_HOST
}