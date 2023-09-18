const dotenv = require('dotenv')
const path = require('path');


var admin = require("firebase-admin");

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });

var serviceAccount = require(process.env.ADMIN_PATH);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;