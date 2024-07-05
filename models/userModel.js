const mongoose = require ('mongoose')
const jwt = require("jsonwebtoken")
require('dotenv').config()
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const CustomError = require("../utils/errors/CustomError")

const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
  };
  const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY,
  };
  const RESET_PASSWORD_TOKEN = {
    expiry: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS,
  };
  


const userSchema = new mongoose.Schema({
    username:{
        type:String,
    },
    email:{
        type:String,
        require:true,
        unique:true

    },
    phone:{
        type:String,
    },
    password:{
        type:String,
        require:true,
    },
    confirmedPassword:{
        type:String,
        require:true,
    },
    fullname:{
      type:String,
    },
    gender:{
      type:Boolean
    },
    birthday:{
      type:Date
    },
    created_at:{
      type:Date
    },
    updated_at:{
      type:Date
    },
    is_deleted:{
      type:Boolean
    },
    calo_target:{
      type:Number,
      default: 1500
    },
    weight_target:{
      type:Number
    },
    water_target:{
      type:Number,
      default: 1500
    },
    sleep_target:{
      type:Number,
      default: 480
    },
    step_target:{
      type:Number
    },
    sleep_end_target:{
      type:Date
    },
    sleep_begin_target:{
      type:Date
    },
    exercise_day_target:{
      type:Number
    },
    career:{
      type:String
    },
    blood_type:{
      type:String
    },
    height:{
      type:Number
    },
    cccd:{
      type:String
    },
    calo_burn_target:{
      type:Number,
      default: 1500
    },
    //store refresh token in database
    tokens: [
        {
          token: { required: true, type: String },
        },
      ],
    resetpasswordtoken: String,
    resetpasswordtokenexpiry: Date,
});
//retrieve some feilds we need in the document - remove insensitive information
userSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret, options) {
      const { email,phone,career,blood_type,fullname,gender,birthday,cccd,calo_target,water_target, exercise_day_target, calo_burn_target, sleep_target, sleep_begin_target, sleep_end_target } = ret;
      
      return { email,phone,career,blood_type,fullname,gender,birthday,cccd,calo_target,water_target, exercise_day_target,calo_burn_target, sleep_target, sleep_begin_target, sleep_end_target }; // return fields we need
    },
});
//ensures that password attribute of a user is hashed if it was modified
userSchema.pre("save", async function (next) {
    try {
      if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
      next();
    } catch (error) {
      next(error);
    }
});
//create access token
userSchema.methods.generateAcessToken = function () {
    const user = this;
    // Create signed access token

    const accessToken = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
      },
      ACCESS_TOKEN.secret,
      {
        expiresIn: ACCESS_TOKEN.expiry,
      }
    );
  
    return accessToken;
};
//create refresh token
userSchema.methods.generateRefreshToken = async function () {
    const user = this;
  
    // Create signed refresh token
    const refreshToken = jwt.sign(
      {
        _id: user._id.toString(),
      },
      REFRESH_TOKEN.secret,
      {
        expiresIn: REFRESH_TOKEN.expiry,
      }
    );
  
    // Create a 'refresh token hash' from 'refresh token'
    const rTknHash = crypto
      .createHmac("sha256", REFRESH_TOKEN.secret)
      .update(refreshToken)
      .digest("hex");
  
    // Save 'refresh token hash' to database
    user.tokens.push({ token: rTknHash });
    await user.save();
  
    return refreshToken;
};

userSchema.methods.generateResetToken = async function () {
    const resetTokenValue = crypto.randomBytes(20).toString("base64url");
    const resetTokenSecret = crypto.randomBytes(10).toString("hex");
    const user = this;
  
    // Separator of `+` because generated base64url characters doesn't include this character
    const resetToken = `${resetTokenValue}+${resetTokenSecret}`;
  
    // Create a hash
    const resetTokenHash = crypto
      .createHmac("sha256", resetTokenSecret)
      .update(resetTokenValue)
      .digest("hex");
  
    user.resetpasswordtoken = resetTokenHash;
    user.resetpasswordtokenexpiry =
      Date.now() + (RESET_PASSWORD_TOKEN.expiry || 5) * 60 * 1000; // Sets expiration age
  
    await user.save();
  
    return resetToken;
};  
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    console.log(user)
    if (!user)
    throw new CustomError(
        "Wrong                                                                                                                        !",
        400,
        "Email or password is wrong!"
      );
    const passwdMatch = await bcrypt.compare(password, user.password);
    console.log(user.password)
    if (!passwdMatch)
    throw new CustomError(
        "Wrong credentials!!",
        400,
        "Email or password is wrong!"
      );
    return user;
  };
const User = mongoose.model('users',userSchema);
module.exports = User;