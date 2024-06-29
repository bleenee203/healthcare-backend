const  mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires: 60,
    }
})
//define a function to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(
            email,
            "Verify your Email",
            `<h2>Verify your email address</h2>
            <p>You need to verify your email address to continue using your Gen-Z Energy account. Enter the following code to verify your email address: <br><b style="color:red;">${otp}</b></p>
            <p>In case you were not trying to access your Gen-Z Energy Account & are seeing this email, please follow the instructions below:</p>              
            <p>Reset your Gen-Z Energy password.</p>
            <p>Check if any changes were made to your account & user settings. If yes, revert them immediately.</p>
            <p>If you are unable to access your Gen-Z Energy Account then contact Gen-Z Energy Support</p>
            `
        )
        console.log(`Email sent successfully: ${mailResponse}`)
    }catch(err){
        console.log(`Error ocurred while sending email: ${err}`)
    }
}
//create a middleware to send automaticaly email when otp is generated
OTPSchema.pre("save",async function(next){
    console.log("New otp saved to the database");
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp)
    }
    next();
})
module.exports = mongoose.model("otps",OTPSchema)