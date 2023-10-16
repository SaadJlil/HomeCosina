const AppError = require('./../Exceptions/AppError');
const ClientError = require('./../Exceptions/ClientError');
const prisma = require('./../Config/Prisma')


class UserDataAccess{

    static async GetUserById(Id){
        try{
            const User = await prisma.User.findFirst({
                where: {
                    id: Id
                }
            });

            return User;
        }
        catch(err){
            throw new AppError(`Can't get the info of the following user: ${Id}`);
        }
    }


    static async confirmEmailById(userId){
        try{
            await prisma.User.update({
                where: {
                    id: userId,
                },
                data: {
                    emailconfirmed: true,
                },
            });
        }
        catch(err){
            throw new AppError("Can't confirm the user email");
        }

    }

    static async userEmailConfirmed(userId){
        try{
            const userExists = await prisma.User.findFirst({
                where: {
                    id: userId,
                    emailconfirmed: true
                }
            });

            return !!userExists;

   
        }
        catch(err){
            throw new AppError("Can't confirm if email is confirmed");
        }
    }


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