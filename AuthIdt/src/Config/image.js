const dotenv = require('dotenv');
const path = require('path');

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });



module.exports = {
  thumbnailHeight : parseInt(process.env.THUMBNAIL_USER_HEIGHT),
  thumbnailWidth: parseInt(process.env.THUMBNAIL_USER_WIDTH),
  mainHeight : parseInt(process.env.MAIN_USER_HEIGHT),
  mainWidth: parseInt(process.env.MAIN_USER_WIDTH)
};


