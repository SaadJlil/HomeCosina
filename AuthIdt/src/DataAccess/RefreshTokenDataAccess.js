const AppError = require('./../Exceptions/AppError');
const prisma = require('./../Config/Prisma');
const ClientError = require('./../Exceptions/ClientError');


class RefreshTokenDataAccess{
    static async refreshTokenUserExists(userId, tokenId){

        try{
            const TokenExists = await prisma.RefreshToken.findFirst({
                where: {
                    id: tokenId,
                    userId: userId
                }
            });
            return !!TokenExists;
        }
        catch(err){
            throw new AppError(err.message, 500);
        }

    }


    static async getUserRefreshTokens(userId){

        try{
            const refreshTokens = await prisma.User.findFirst({
                where: {
                    id: userId
                },
                select: {
                    refreshToken: true
                }
            });

            return refreshTokens;
        }
        catch(err){
            throw new AppError(err.message, 500);
        }

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


    static async removeRefreshTokenUser(userId, tokenId){
        try {
            const result = await prisma.RefreshToken.delete({
                where: {
                    id: tokenId,
                    userId: userId
                }
            });
        }
        catch(err){
            throw new ClientError("Wrong token", 400);
        }
    }


    static async removeRefreshTokenById(tokenId){
        try {
            const result = await prisma.RefreshToken.delete({
                where: {
                    id: tokenId,
                }
            });
        }
        catch(err){
            throw new AppError("Can't delete RefreshToken", 500);
        }
    }

}


module.exports = RefreshTokenDataAccess;