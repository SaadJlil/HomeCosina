const jwt = require("jsonwebtoken");
const config = require("../Config/token");
const AppError = require("../Exceptions/AppError");
const RefreshTokenDataAccess = require("../DataAccess/RefreshTokenDataAccess");
const ClientError = require("../../dist/Exceptions/ClientError");




async function sign(playload, secretToken, options){
    try {
      const token = await jwt.sign(playload, secretToken, options);
      return token;
    } catch (err) {
      throw new AppError(err.message);
    }
}

class TokenService{

  static async createAccessToken(_id, refreshId){
    try {
      const payload = {
        id: _id,
        refreshId: refreshId
      };

      const options = {
        algorithm: "HS512",
        subject: _id,
        expiresIn: config.expireAccess
      };

      const token = await sign(payload, config.secretAccess, options);

      const data = await jwt.verify(token, config.secretAccess);

      return token;
    } catch (err) {
        throw new AppError(err.message);
    }
 }

  static async createRefreshToken(uid){
    try {

      const payload = {
        id: uid 
      };

      const options = {
        algorithm: "HS512",
        subject: uid,
        expiresIn: config.expireRefresh
      };


      const token = await sign(payload, config.secretRefresh, options);

      const refreshTokensObj = await RefreshTokenDataAccess.getUserRefreshTokens(uid);
      const refreshTokens = refreshTokensObj.refreshToken;

      if(refreshTokens.length > config.limitNumberRefreshTokens){

        const OldestRefreshTokenId = refreshTokens.reduce((min, current) => 
          current.date < min.date ? current : min
        ).id;

        await RefreshTokenDataAccess.removeRefreshTokenById(OldestRefreshTokenId);

      }



      const id = await RefreshTokenDataAccess.createRefreshToken(token, uid);


      return `${id}::${token}`;
    } catch (err) {
      throw new AppError(err.message);
    }
  }


  static async createEmailToken(userId){
    try {
      const payload = {
        id: userId
      };

      const options = {
        algorithm: "HS256",
        subject: userId,
        expiresIn: config.expireEmail
      };

      const token = await sign(payload, config.secretEmail, options);

      return token;
    } catch (err) {
      throw new AppError(err.message);
    }
  }

  static async verifyEmailToken(token){
    try {
      const data = await jwt.verify(token, config.secretEmail);

      return data;
    } catch (err) {
      throw new ClientError("Wrong email confirmation link", 400);
    }
  }

  static async createRestorePasswordToken(uid){
    try {
      const payload = {
        id: uid 
      };

      const options = {
        algorithm: "HS512",
        subject: uid,
        expiresIn: config.expireRestore
      };

      const token = await sign(payload, config.secretRestore, options);

      return token;
    } catch (err) {
      throw new AppError(err.message);
    }
  }


  static async removeRefreshTokenUser(userId, tokenId){
    await RefreshTokenDataAccess.removeRefreshTokenUser(userId, tokenId);
  }

  static async verifyRefreshToken(token){
    try {
      const refreshTokenHash = token.split("::")[1];
      const data = await jwt.verify(refreshTokenHash, config.secretRefresh);

      return data;
    } catch (err) {
      throw new ClientError("Refresh token invalid or expired", 400);
    }
  }

  static async verifyAccessToken(token){
    try {
      const data = await jwt.verify(token, config.secretAccess);

      return data;
    } catch (err) {
      throw new ClientError("Refresh token invalid or expired", 401)
    }
  }


  static async checkRefreshTokenUser(userId, token) {
      const refreshTokenId = token.split("::")[0];

      const tokenExists = await RefreshTokenDataAccess.refreshTokenUserExists(userId, refreshTokenId);

      if(!tokenExists){
        throw new ClientError("Refresh token invalid or expired", 400);
      }
   }

  



}


module.exports = TokenService;







/*
const addRefreshTokenUser = async (user, token) => {
  try {

    if (user.refreshTokens.length >= config.countTokenLimit) {
      user.refreshTokens = [];
    }

    const objectId = mongoose.Types.ObjectId();
    user.refreshTokens.push({ _id: objectId, token });
    await user.save();

    return `${objectId}::${token}`;
  } catch (err) {
    throw new AppError(err.message);
  }
};
*/



/*


const checkRefreshTokenUser = async (user, token) => {
  try {
    const refreshTokenId = token.split("::")[0];

    const isValid = user.refreshTokens.find(
      refreshToken => refreshToken._id.toString() === refreshTokenId.toString()
    );

    return !!isValid;
  } catch (err) {
    throw new AppError(err.message);
  }
};

export default {
  sign,
  createAccessToken,
  createRefreshToken,
//  addRefreshTokenUser,
  removeRefreshTokenUser,
  verifyRefreshToken,
  checkRefreshTokenUser,
  verifyAccessToken,
  createRestorePasswordToken,
  verifyRestorePasswordToken
};
*/