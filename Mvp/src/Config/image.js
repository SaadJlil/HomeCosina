const dotenv = require('dotenv');
const path = require('path');

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });



module.exports = {
  thumbnailHeight : parseInt(process.env.THUMBNAIL_HEIGHT),
  thumbnailWidth: parseInt(process.env.THUMBNAIL_WIDTH)
};


