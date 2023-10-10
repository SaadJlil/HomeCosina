const httpErrors = require("http-errors");
const ValidationError = require("./../Exceptions/ValidationError");
const ClientError = require("./../Exceptions/ClientError");
//const logger = require("../utils/logger");
const config = require("./../Config/app");


module.exports = function(err) {
    const status = err.code || 500;
    const httpError = httpErrors(status);
    const errorMessage = err.errorMessage || "Unknown error";
    const errorType = err.errorType || "Unknown ErrorType";
    const response = { code: status };

    //Object.assign(response, { success: err.success});
    Object.assign(response, { errorType: errorType});

    if (err instanceof ValidationError) {
        Object.assign(response, { httpErrorMessage: httpError.message });
        Object.assign(response, { errorMessage : errorMessage });
    } else if (err instanceof ClientError) {
        Object.assign(response, { httpErrorMessage: httpError.message });
        Object.assign(response, { message: errorMessage });
        //logger.info(errorMessage, { url: req.originalUrl, method: req.method });
    } else {
        Object.assign(response, { message: httpError.message });
        //logger.error(err.stack, { url: req.originalUrl, method: req.method });
    }

    if (config.isDev) {
        Object.assign(response, { errorStack: err.stack });
    }

    return {status: status, errorStructure: response};

};