

class errorResponse extends Error{
    constructor(message, code, errorType){
        super(message);
        this.success = false
        this.errorMessage = message
        this.code = code
        this.errorType = errorType
    }
}

module.exports = errorResponse;