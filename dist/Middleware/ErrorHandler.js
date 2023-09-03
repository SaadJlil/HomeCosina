"use strict";

var httpErrors = require("http-errors");
var ValidationError = require("../Exceptions/ValidationError");
var ClientError = require("../Exceptions/ClientError");
//const logger = require("../utils/logger");
var config = require("../Config/app");
module.exports = function (err, req, res, next) {
  console.log("***********************************88");
  var status = err.status || 500;
  var httpError = httpErrors(status);
  var errorMessage = err.message || "Unknown error";
  var response = {
    code: status
  };
  if (err instanceof ValidationError) {
    Object.assign(response, {
      message: httpError.message
    });
    Object.assign(response, {
      errorValidation: err.validationErrors
    });
  } else if (err instanceof ClientError) {
    Object.assign(response, {
      message: errorMessage
    });
    //logger.info(errorMessage, { url: req.originalUrl, method: req.method });
  } else {
    Object.assign(response, {
      message: httpError.message
    });
    //logger.error(err.stack, { url: req.originalUrl, method: req.method });
  }

  if (config.isDev) {
    Object.assign(response, {
      error: err.stack
    });
  }
  res.status(status);
  res.json(response);
};