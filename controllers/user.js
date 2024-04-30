const User = require("../models/user");

module.exports.fetchAuthUserProfile = async (req, res, next) => {
    try {
      const userId = req.body._id.$oid;
      console.log(userId)
      const user = await User.findById(userId);
    
      res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };