"use strict";

var dotenv = require('dotenv');
var path = require('path');
var root = path.join.bind(void 0, __dirname, "../../");
dotenv.config({
  path: root(".env")
});
if (!process.env.HOST || !process.env.PORT) {
  throw new Error("Can`t find .env config varibles for work app");
}
var isDev = process.env.NODE_ENV === "development";
var isProd = !isDev;
module.exports = {
  host: process.env.HOST,
  port: process.env.PORT,
  frontendHost: process.env.FRONTEND_HOST,
  isDev: isDev,
  isProd: isProd
};