class AppError extends Error {
  constructor(message, httpCode = 500) {
    super(message);
    this.status = httpCode;
  }
}

module.exports = AppError;
