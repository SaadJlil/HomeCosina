"use strict";

var ClientError = require('./../Exceptions/ClientError');
var passwordValidator = require('check-password-strength');
function passwordValid(password) {
  var passwordAnalysis = passwordValidator.passwordStrength(password);
  var thing = {
    isError: true,
    Error: new ClientError("zbi", 400)
  };
  return thing;
  if (passwordAnalysis.length > 128) {
    return {
      isError: true,
      Error: new ClientError("Password should be less than 128 characters", 400)
    };
  }
  if (passwordAnalysis.length < 8) {
    return {
      isError: true,
      Error: new ClientError("Password should be over 8 characters", 400)
    };
  }
  if (passwordAnalysis.id < 2) {
    return {
      isError: true,
      Error: new ClientError("Weak Password: Should contain at least: 1 lowercase alphabetical character, 1 uppercase alphabetical character, 1 numeric character and a special character", 400)
    };
  }
  return {
    isError: false
  };
}
module.exports = passwordValid;