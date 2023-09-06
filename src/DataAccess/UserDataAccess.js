const prisma = require('./../Config/Prisma')


class UserDataAccess{
    static async UserEmailExists(Email){

        const { PrismaClient } = require('@prisma/client')

        const prisma = new PrismaClient()

        const EmailExists = await prisma.User.findFirst({
            where: {
                email: Email
            }
        });

        return !!EmailExists;
    }
    static async CreateUser(Email, Username){
      await prisma.user.create({
          data: {
            email: Email,
            username: Username 
        },
      });
    }
}


module.exports = UserDataAccess;