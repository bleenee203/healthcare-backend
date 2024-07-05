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

    if (newData['sleep_begin_target']) {
      const timeString = newData['sleep_begin_target'];
      
      const [hours, minutes] = timeString.split(":").map(part => parseInt(part, 10));
      if (!isNaN(hours) && !isNaN(minutes)) {
        const sleepBeginTarget = new Date();
        sleepBeginTarget.setHours(hours, minutes, 0); // Đặt giờ, phút và giây
      
        newData['sleep_begin_target'] = sleepBeginTarget;
      } else {
        console.error('Invalid time format:', timeString);
        // Xử lý lỗi hoặc thông báo lỗi cho người dùng
      }
    }

    if (newData['sleep_end_target']) {
      const timeString = newData['sleep_end_target'];
      const [hours, minutes] = timeString.split(":").map(part => parseInt(part, 10));

      if (!isNaN(hours) && !isNaN(minutes)) {
        const sleepEndTarget = new Date();
        sleepEndTarget.setHours(hours, minutes, 0); // Đặt giờ, phút và giây
      
        newData['sleep_end_target'] = sleepEndTarget;
      } else {
        console.error('Invalid time format:', timeString);
        // Xử lý lỗi hoặc thông báo lỗi cho người dùng
      }
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