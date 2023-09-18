const errorResponse = require("./../Contracts/errorResponse")


class ClientError extends errorResponse {
  constructor(message, httpCode = 400) {
    super(message, httpCode, "ClientError");
  }
}



module.exports = ClientError;