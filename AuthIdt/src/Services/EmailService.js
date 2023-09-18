const AppError = require("./../Exceptions/AppError");
const nodemailer = require('nodemailer');
const config = require("../Config/email");
const emailjs = require("@emailjs/nodejs");


class EmailService {
    static async sendConfirmationEmail(userEmail, username, confirmationLink){
        try{
            await emailjs.send(
                config.emailConfirmationServiceId,
                config.emailConfirmationTemplateId, 
                {
                    emailTo: userEmail,
                    username: username,
                    confirmationLink: confirmationLink
                }, 
                {
                    publicKey: config.emailPublicKey,
                    privateKey: config.emailPrivateKey 
                }
            );
        }
        catch(err){
            throw new AppError("Couldn't send confirmation email")
        }
    }
}

module.exports = EmailService;
