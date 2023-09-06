// Import the functions you need from the SDKs you need

const firebase = require("firebase/compat/app");
require("firebase/compat/auth");
require("firebase/compat/firestore");
//const anly = require("firebase/analytics");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfEAKg7kNfxmG8BX6HXxQF5GKPdfiL5fU",
  authDomain: "homecosina-862e2.firebaseapp.com",
  projectId: "homecosina-862e2",
  storageBucket: "homecosina-862e2.appspot.com",
  messagingSenderId: "974165210010",
  appId: "1:974165210010:web:7812fc24503abbe2b80023",
  measurementId: "G-XKVRMQKK08"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
//const analytics = anly.getAnalytics(app);

module.exports = firebase;