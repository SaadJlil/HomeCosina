"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var errorHandler = require("./Middleware/ErrorHandler");
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');
var httpError = require('http-errors');
var routes = require('./Routes');
var config = require('./Config/app');
require("@babel/core").transformSync("code", {
  plugins: [["@babel/plugin-proposal-decorators", {
    version: "2023-05"
  }]]
});
var app = express();
var morganFormat = config.isDev ? "dev" : "combined";
app.use(morgan(morganFormat));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.use.apply(app, ["/api"].concat(_toConsumableArray(routes)));
app.use(function (req, res, next) {
  next(httpError(404));
});
app.use(errorHandler);
app.listen(config.port, function () {
  console.log("Server started ".concat(config.host, ":").concat(config.port));
});