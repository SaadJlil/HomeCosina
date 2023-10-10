const request = require('request')
const ErrorCatcher = require('./../Decorators/TryCatchErrorsDecorator');
const authConfig = require('../Config/auth');

const ClientError = require('../Exceptions/ClientError');

function doRequest(options) {
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
        if (!error) {// && res.statusCode === 200
            resolve(body);
        } else {
            reject(body);
        }
        });
    });
}


class AuthMiddleware{

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async AuthorizeMethod(parent, args, context) {
        try{
            const sym = Reflect.ownKeys(args).find(s => {
                return String(s) === "Symbol(kHeaders)";
            });

            const accessToken = args[sym].authorization;

            var options = {
                method: 'GET',
                uri: authConfig.authUri,
                headers: {
                    'Authorization': accessToken
                }
            };

            let response = await doRequest(options)

            response = JSON.parse(response)
            if(response.success) {
                parent.userId = response.data.userId;
            }
            else{
                throw new ClientError("Refresh token invalid or expired\n", 401)
            }
            


        }
        catch(err){
            throw err;
        }


    }



    @ErrorCatcher.TryCatchErrorsDecorator
    static Authorize(resolver) {
        try{
            return async (parent, args, context) => 
                {
                    await AuthMiddleware.AuthorizeMethod(parent, args, context);
                    return await resolver(parent, args, context);
                }
        }
        catch(err) {
            throw err;
        }

    }
}


module.exports = AuthMiddleware;