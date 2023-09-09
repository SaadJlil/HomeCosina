const prisma = require('./../Config/Prisma')


class UserDataAccess{
    static async UserEmailExists(Email){

        const EmailExists = await prisma.User.findFirst({
            where: {
                email: Email
            }
        });

        return !!EmailExists;
    }

    static async UsernameExists(Username){

        const UsernameExists = await prisma.User.findFirst({
            where: {
                username: Username 
            }
        });

        return !!UsernameExists;
    }


    static async CreateUser(uid, Email, Username){
      await prisma.user.create({
          data: {
            id: uid, 
            email: Email,
            username: Username 
        },
      });
    }
}


module.exports = UserDataAccess;