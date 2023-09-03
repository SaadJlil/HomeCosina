


const prisma = require('./../Config/Prisma')



/*

        await prisma.user.create({
            data: {
              name: 'Saad',
              email: 'sailjlad@prisma.io',
              posts: {
                create: { title: 'Hello World' },
              },
              profile: {
                create: { bio: 'I like turtles' },
              },
            },
        });
*/




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
}


module.exports = UserDataAccess;