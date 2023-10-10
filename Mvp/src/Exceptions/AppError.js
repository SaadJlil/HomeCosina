const errorResponse = require("./../Contracts/errorResponse")


class AppError extends errorResponse {
  constructor(message, httpCode = 500) {
    super(message, httpCode, "AppError");
  }
}



module.exports = AppError;
