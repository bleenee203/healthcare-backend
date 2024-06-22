const food = require("../models/foodModel");
module.exports.createFood = async (req,res,next) =>{
    try{
        const {food_name,kcal,carbs,protein,fat} = req.body
        if(!food_name){
            return res.status(403).send({
            success:false,
            message:"Please provide name of food"});
        }
        const existingFood = await food.findOne({food_name})
        console.log(existingFood);
        if(existingFood){
            return res.status(400).json({
                success:false,
                message:"Food already exists"
            })
        }
        const Food =await food.create({food_name,kcal,carbs,protein,fat})
        return res.status(200).json({
            success: true,
            Food,
            message: "Food created successfully",
        })
    }catch(error){
        console.log(error)
        next(error)
    }
};
exports.updateFood = async (req, res, next) => {
    try {
      const  id  = req.params.id;
      const { food_name,kcal,carbs,protein,fat} = req.body;
      const updatedFood = await food.findByIdAndUpdate(id, { food_name,kcal,carbs,protein,fat}, { new: true });
      if (!updatedFood) {
        return res.status(404).json({ message: 'Food not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Food updated successfully',
        data: updatedFood,
      });
    } catch (err) {
      next(err);
    }
  };
  exports.deleteFood = async (req, res, next) => {
    try {
      const  id  = req.params.id;
      const updatedFood = await food.findByIdAndUpdate(id, { isDeleted:false});
      if (!updatedFood) {
        return res.status(404).json({ message: 'Food not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Food deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  exports.getAllFood = async (req, res, next) => {
    try {
      const foods = await food.find({isDeleted:false})
      return res.status(200).json({
        success: true,
        foods
      });
    } catch (err) {
      next(err);
    }
  };
  exports.getFoodByName = async (req, res, next) => {
    try {
      const { food_name } = req.body;
      const Food = await food.findOne({food_name:food_name,isDeleted:false});
      if (!Food) {
        return res.status(404).json({ message: 'Food not found' });
      }
      res.json(Food);
    } catch (err) {
      next(err);
    }
  };