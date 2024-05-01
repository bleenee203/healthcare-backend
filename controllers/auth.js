const bcrypt = require('bcrypt')
const user = require('../models/user')
const otpGenerator = require("otp-generator")
const OTP = require('../models/otp')
const crypto = require("crypto");
const AuthorizationError = require("../utils/errors/AuthorizationError");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const CustomError = require('../utils/errors/CustomError');
const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
    cookie: {
      name: "refreshTkn",
      options: {
        sameSite: "None",
        secure: true,
        httpOnly: false,
        expires: new Date(Date.now() + 5*24 * 60 * 60 * 1000),
      },
    },
  };
const RESET_PASSWORD_TOKEN = {
    expiry: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS,
};
exports.signup = async(req,res)=>{
    try{
        //get input data
        const {email,password,otp,confirmedPassword} = req.body
        //check if any field are empty or not?
        if(!email||!password||!confirmedPassword||!otp){
            return res.status(403).send({
                success:false,
                message:"All fields are required"
            })
        }
        //check if user already exists?
        const existingUser  = await user.findOne({email})
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }
        //find the most recent otp for the email
        const response = await OTP.find({email}).sort({createdAt:-1}).limit(1)
        //it returns an array with length = 1 if it successes
        //check if database has otp or otp in the datase is diffrent from otp received
        if(response.length ===0||otp!=response[0].otp){
            return res.status(400).json({
                success:false,
                message:'The OTP is not valid'
            })
        }
        
        const User = await user.create({
            email, password,
        })

        // //create access token
        // const aTkn = await User.generateAcessToken();
        // //create refresh token
        // const refreshToken = await User.generateRefreshToken();
        // //set a refresh token cookie in response
        // res.cookie(
        //     REFRESH_TOKEN.cookie.name,
        //     refreshToken,
        //     REFRESH_TOKEN.cookie.options
        //   );
        
        return res.status(200).json({
            success: true,
            User,
            message: "User created successfully",
            // accessToken: aTkn,
            // refreshToken: refreshToken
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message: "User registration failed"
        })
    }
}
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        /* Custom methods on user are defined in User model */
        const loginuser = await user.findByCredentials(email, password); // Identify and retrieve user by credentials
        const accessToken = await loginuser.generateAcessToken(); // Create Access Token
        const refreshToken = await loginuser.generateRefreshToken(); // Create Refresh Token

        // SET refresh Token cookie in response
        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        );
        // res.cookie(
        //     ACCESS_TOKEN.cookie.name,
        //     accessToken,
        //     ACCESS_TOKEN.cookie.options
        // );
        
        // Send Response on successful Login
        res.json({
            success: true,
            loginuser,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};
//send OTP for email verification
exports.sendotp = async(req,res)=>{
    try{
        const {email} = req.body;
        //check if user is already present
        //find user with provided email
        // const checkUserPresent = await user.findOne({email})
        // if(checkUserPresent){
        //     return res.status(401).json({
        //         success:false,
        //         message:"User is already register"
        //     })
        // }
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        const result = await OTP.findOne({otp:otp})
        console.log("Result is generate OTP")
        console.log(`OTP ${otp}`)
        console.log(`Result ${result}`)
        //if otp already exists, create another otp
        while (result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await OTP.findOne({otp:otp})
        }
        //create otp schema
        const otpPayload = {email,otp}
        const otpBody = await OTP.create(otpPayload)
        console.log(`OTP Body ${otpBody}`)
        res.status(200).json({
            succes:true,
            message: "OTP sent successfully",
            otp
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

module.exports.logout = async (req, res, next) => {
    try {
      // Authenticated user ID attached on `req` by authentication middleware
      const userId = req.body._id.$oid;
      const userlogin = await user.findById(userId);
  
      const cookies = req.cookies;
      // const authHeader = req.header("Authorization");
      const refreshToken = cookies[REFRESH_TOKEN.cookie.name];
      console.log(cookies)
      // Create a refresh token hash
      const rTknHash = crypto
        .createHmac("sha256", REFRESH_TOKEN.secret)
        .update(refreshToken)
        .digest("hex");
        userlogin.tokens = userlogin.tokens.filter((tokenObj) => tokenObj.token !== rTknHash);
      await userlogin.save();
  
      // Set cookie expiry to past date so it is destroyed
      const expireCookieOptions = Object.assign(
        {},
        REFRESH_TOKEN.cookie.options,
        {
          expires: new Date(1),
        }
      );
  
      // Destroy refresh token cookie
      res.cookie(REFRESH_TOKEN.cookie.name, "", expireCookieOptions);
      res.status(205).json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
module.exports.refreshAccessToken = async (req, res, next) => {
    try {
      const cookies = req.cookies;
      // const authHeader = req.header("Authorization");
      const refreshToken = cookies[REFRESH_TOKEN.cookie.name];
  
      if (!refreshToken) {
        throw new AuthorizationError(
          "Authentication error!",
          undefined,
          "You are unauthenticated",
          {
            realm: "reauth",
            error: "no_rft",
            error_description: "Refresh Token is missing!",
          }
        );
      }
  
      const decodedRefreshTkn = jwt.verify(refreshToken, REFRESH_TOKEN.secret);
      const rTknHash = crypto
        .createHmac("sha256", REFRESH_TOKEN.secret)
        .update(refreshToken)
        .digest("hex");
      const userWithRefreshTkn = await user.findOne({
        _id: decodedRefreshTkn._id,
        "tokens.token": rTknHash,
      });
      if (!userWithRefreshTkn)
        throw new AuthorizationError(
          "Authentication Error",
          undefined,
          "You are unauthenticated!",
          {
            realm: "reauth",
          }
        );
  
      // GENERATE NEW ACCESSTOKEN
      const newAtkn = await userWithRefreshTkn.generateAcessToken();
      // GENERATE NEW REFRESHTOKEN
      // const newRtkn = await userWithRefreshTkn.generateRefreshToken();
  
      res.status(201);
      res.set({ "Cache-Control": "no-store", Pragma: "no-cache" });
  
      // Send response with NEW accessToken
      res.json({
        success: true,
        accessToken: newAtkn,
      });
    } catch (error) {
      console.log(error);
      if (error?.name === "JsonWebTokenError")
        return next(
          new AuthorizationError(error, undefined, "You are unauthenticated", {
            realm: "reauth",
            error_description: "token error",
          })
        );
      next(error);
    }
};

module.exports.forgotPassword = async (req, res, next) => {
    const MSG = `If ${req.body?.email} is found with us, we've sent an email to it with instructions to reset your password.`;
    try {
      const email = req.body.email;
      const userloss = await user.findOne({ email });
      // If email is not found, we throw an exception BUT with 200 status code
      // because it is a security vulnerability to inform users
      // that the Email is not found.
      // To avoid username enumeration attacks, no extra response data is provided when an email is successfully sent. (The same response is provided when the username is invalid.)
      if (!userloss) throw new CustomError("Reset otp sent", 200, MSG);
      next()
    } catch (err) {
      next(err);
    }
};

module.exports.resetPassword = async (req, res, next) => {
    try {
      const {email,password} = req.body
      const lossuser  = await user.findOne({email})
      lossuser.password=password
      await lossuser.save()
      res.json({
        message: "Password reset successful",
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  module.exports.verifyotp = async (req, res, next) => {
    try {
      const {email,otp} = req.body
      //find the most recent otp for the email
      const response = await OTP.find({email}).sort({createdAt:-1}).limit(1)
      //it returns an array with length = 1 if it successes
      //check if database has otp or otp in the datase is diffrent from otp received
      if(response.length ===0||otp!=response[0].otp){
          return res.status(400).json({
              success:false,
              message:'The OTP is not valid'
          })
      }
      res.json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };