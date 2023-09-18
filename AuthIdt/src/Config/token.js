const dotenv = require("dotenv");
const path = require("path");

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });

const secretAccess = process.env.SECRET_TOKEN_ACCESS;
const expireAccess = process.env.EXPIRE_TOKEN_ACCESS;

const secretRefresh = process.env.SECRET_TOKEN_REFRESH;
const expireRefresh = process.env.EXPIRE_TOKEN_REFRESH;

const secretRestore = process.env.SECRET_TOKEN_RESTORE_PASSWORD;
const expireRestore = process.env.EXPIRE_TOKEN_RESTORE_PASSWORD;

const secretEmail = process.env.SECRET_TOKEN_EMAIL;
const expireEmail = process.env.EXPIRE_TOKEN_EMAIL;

const limitNumberRefreshTokens = process.env.LIMIT_NUMBER_REFRESHTOKENS;

module.exports = {
  expireEmail,
  secretEmail,
  secretAccess,
  expireAccess,
  secretRefresh,
  expireRefresh,
  secretRestore,
  expireRestore,
  limitNumberRefreshTokens 
};
