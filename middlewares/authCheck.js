const jwt = require('jsonwebtoken')
require('dotenv').config()
// Pull in Environment variables
const ACCESS_TOKEN = {
  secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
};

module.exports.requireAuthentication = async (req, res, next) => {
  try {
    // if (!authHeader?.startsWith("Bearer "))
    // //   throw new AuthorizationError(
    // //     "Authentication Error",
    // //     undefined,
    // //     "You are unauthenticated!",
    // //     {
    // //       error: "invalid_access_token",
    // //       error_description: "unknown authentication scheme",
    // //     }
    // //   );
    // throw {
    //     name: "AuthorizationError",
    //     message: "Authentication Error",
    //     status: 401,
    //     details: "You are unauthenticated!",
    //     error: "invalid_access_token",
    //     error_description: "unknown authentication scheme",
    //   };

    const aTkn = req.headers.authorization.split(' ')[1];
    console.log(aTkn)
    console.log(ACCESS_TOKEN.secret)
    const decoded = jwt.verify(aTkn, ACCESS_TOKEN.secret);
    // Attach authenticated user and Access Token to request object
    req.userId = decoded._id;
    req.token = aTkn;
    next();
  } catch (err) {
    // Authentication didn't go well
    console.log(err);

    const expParams = {
      error: "expired_access_token",
      error_description: "access token is expired",
    };
    if (err.name === "TokenExpiredError")
      return next(
        new Error(
          "Authentication Error",
          504,
          "Token lifetime exceeded!",
          expParams
        )
    );
    next(err);
  }
};