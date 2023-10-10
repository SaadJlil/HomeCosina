const dotenv = require('dotenv');
const path = require('path');

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });


module.exports = {
  authUri: process.env.AUTHORIZE_URL
};
