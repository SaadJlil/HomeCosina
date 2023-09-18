const dotenv = require("dotenv");
const path = require("path");

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });

const email = process.env.GMAIL_PASSWORD;
const emailPassword = process.env.GMAIL_EMAIL;


const emailPublicKey = process.env.EMAIL_PUBLICKEY;
const emailPrivateKey = process.env.EMAIL_PRIVATEKEY;

const emailConfirmationServiceId = process.env.EMAILCONFIRMATION_SERVICEID;
const emailConfirmationTemplateId = process.env.EMAILCONFIRMATION_TEMPLATEID;

const emailConfirmationLink = process.env.EMAILCONFIRMATION_LINK;


module.exports = {
    emailConfirmationLink,
    emailConfirmationTemplateId,
    emailConfirmationServiceId,
    email,
    emailPassword,
    emailPrivateKey,
    emailPublicKey
};
