const errorResponse = require("./../Contracts/errorResponse")


class ValidationError extends errorResponse {
  constructor(message, httpCode = 422) {
    super(message, httpCode, "ValidationError");
  }
}


module.exports = ValidationError;
