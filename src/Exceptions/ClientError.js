const errorResponse = require("./../Contracts/errorResponse")


class ClientError extends errorResponse {
  constructor(message, httpCode = 400) {
    super(message, httpCode, "ClientError");
  }
}







/*
class ClientError extends Error {
  constructor(message, httpCode = 500) {
    super(message);
    this.status = httpCode;
  }
}
*/



module.exports = ClientError;