const dotenv = require("dotenv");
const path = require("path");

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });


const firebase = require("firebase/compat/app");
require("firebase/compat/auth");
require("firebase/compat/firestore");



const firebaseConfig = {
  apiKey: process.env.FIREBASECONFIG_APIKEY,
  authDomain: process.env.FIREBASECONFIG_AUTHDOMAIN,
  projectId: process.env.FIREBASECONFIG_PROJECTID,
  storageBucket: process.env.FIREBASECONFIG_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASECONFIG_MESSSAGINGSENDERID,
  appId: process.env.FIREBASECONFIG_APPID,
  measurementId: process.env.FIREBASECONFIG_MEASUREMENTID
};


// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
//const analytics = anly.getAnalytics(app);

module.exports = firebase;