const nodemailer = require('nodemailer');
require('dotenv').config()
const mailSender = async (email,title,body) => {
  try{
    //create transport
    let transporter = nodemailer.createTransport({
      host:process.env.MAIL_HOST,
      auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS
      }
    })
    //send emails to users
    let info = await transporter.sendMail({
      from:'GEN-Z ENERGY',
      to: email,
      subject:title,
      html:body
    })
    console.log("Email info: ",info);
    return info;
  }catch(err){
    console.log(err.message);
  }
}
module.exports = mailSender;