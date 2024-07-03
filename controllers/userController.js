const User = require("../models/userModel");
const moment = require('moment');

module.exports.fetchAuthUserProfile = async (req, res, next) => {
    try {
      const userId = req.body.userId;
      console.log(userId)
      const user = await User.findById(userId);
      console.log(user);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
module.exports.updateUserData = async (req,res,next) => {
  try{
    const {userId,newData} = req.body;
    console.log(newData['birthday']);
    if(newData['birthday']){
      newData['birthday'] = moment(newData['birthday'], 'DD/MM/YYYY').add(12, 'hours').toDate();
    }
    const updatedUser = await User.findByIdAndUpdate(userId,newData,{new:true});
    if(!updatedUser){
      return res.status(404),json({
        success:false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User data updated successfully',
      data: updatedUser,
    });
  }catch(error){
    console.error('Error updating user data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user data',
      error: error.message,
    });
  }
}