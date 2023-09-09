const jwt = require("jsonwebtoken");
const config = require("../Config/token");
const AppError = require("../Exceptions/AppError");
const RefreshTokenDataAccess = require("../DataAccess/RefreshTokenDataAccess");




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

      const id = await RefreshTokenDataAccess.createRefreshToken(token, uid);

      return {token, id};
    } catch (err) {
      throw new AppError(err.message);
    }
  };

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
  };

  static async removeRefreshTokenUser(user, token){
    try {
      const refreshTokenId = token.split("::")[0];

      const refreshTokensFiltered = user.refreshTokens.filter(refreshToken => {
        return refreshToken._id.toString() !== refreshTokenId.toString();
      });

      user.refreshTokens = refreshTokensFiltered;
      await user.save();

      return true;
    } catch (err) {
      throw new AppError(err.message);
    }
  };

  static async verifyRefreshToken(token){

    try {
      const refreshTokenHash = token.split("::")[1];
      const data = await jwt.verify(refreshTokenHash, config.secretRefresh);

      return data;
    } catch (err) {
      return false;
    }
  };

  static async verifyAccessToken(token){
    try {
      const data = await jwt.verify(token, config.secretAccess);

      return data;
    } catch (err) {
      return false;
    }
  };


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
const verifyRestorePasswordToken = async token => {
  try {
    const data = await jwt.verify(token, config.secretRestore);

    return data;
  } catch (err) {
    return false;
  }
};

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