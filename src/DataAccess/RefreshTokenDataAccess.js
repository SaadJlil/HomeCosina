const AppError = require('../../dist/Exceptions/AppError');
const prisma = require('./../Config/Prisma')


class RefreshTokenDataAccess{
    static async UsernameExists(Username){

        const UsernameExists = await prisma.User.findFirst({
            where: {
                username: Username 
            }
        });

        return !!UsernameExists;
    }


    static async createRefreshToken(token, userId){
        try{
            const refreshTokenDb = await prisma.RefreshToken.create({
                data: {
                    token: token,
                    userId: userId 
                }
            });

            return refreshTokenDb.id;
 
        }catch(error){
            throw AppError("Couldn't add refreshToken to database", 500);
        }
    }
}


module.exports = RefreshTokenDataAccess;