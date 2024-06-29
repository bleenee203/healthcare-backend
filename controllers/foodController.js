const food = require("../models/foodModel");
module.exports.createFood = async (req,res,next) =>{
    try{
        const {food_name,kcal,carbs,protein,fat,ration,avg_above} = req.body.newData
        console.log(req.body.newData)
        const user_id = req.body.userId
        const isDeleted=false;
        if(!food_name){
            return res.status(403).send({
            success:false,
            message:"Please provide name of food"});
        }
        if(kcal==null){
            return res.status(403).send({
            success:false,
            message:"Please provide kcal of food"});
        }
        const existingFood = await food.findOne({food_name})
        console.log(existingFood);
        if(existingFood){
            return res.status(400).json({
                success:false,
                message:"Food already exists"
            })
        }
        const Food =await food.create({user_id,food_name,kcal,carbs,protein,fat,ration,avg_above,isDeleted})
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
      const { food_name,kcal,carbs,protein,fat,ration,avg_above} = req.body.newData;
      const existingFood = await food.findOne({ food_name, _id: { $ne: id } }); 
    if (existingFood) {
      return res.status(400).json({ message: 'Food name already in use',success:false });
    }
      const updatedFood = await food.findByIdAndUpdate(id, { food_name,kcal,carbs,protein,fat,ration,avg_above}, { new: true });
      if (!updatedFood) {
        return res.status(404).json({ message: 'Food not found',success:false  });
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
      const updatedFood = await food.findByIdAndUpdate(id, { isDeleted:true});
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
  exports.getAllUserFood = async (req, res, next) => {
    try {
      const user_id = req.params.id
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }  
      const foods = await food.find({user_id,isDeleted:false})
      return res.status(200).json({
        success: true,
        foods
      });
    } catch (err) {
      next(err);
    }
  };
  exports.getAllFood = async (req, res, next) => {
    try {
      const foods = await food.find({user_id:null,isDeleted:false})
      return res.status(200).json({
        success: true,
        "foods":foods
      });
    } catch (err) {
      next(err);
    }
  };
  exports.getFoodByName = async (req, res, next) => {
    try {
      const { name } = req.query;
      const regex  = new RegExp(name,'i');
      const foods = await food.find({food_name:regex,isDeleted:false,user_id:null});
      if (!foods) {
        return res.status(404).json({ message: 'Food not found' });
      }
      res.json(foods);
    } catch (err) {
      next(err);
    }
  };
  exports.getUserFoodByName = async (req, res, next) => {
    try {
      const { name,id } = req.query;
      const regex  = new RegExp(name,'i');
      const foods = await food.find({food_name:regex,isDeleted:false,user_id:id});
      if (!foods) {
        return res.status(404).json({ message: 'Food not found' });
      }
      res.json(foods);
    } catch (err) {
      next(err);
    }
  };
  // exports.getFoodById = async (req, res, next) => {
  //   try {
  //     const id  = req.params.id;
  //     const Food = await food.findById(id);
  //     if (!Food) {
  //       return res.status(404).json({ message: 'Food not found' });
  //     }
  //     return res.status(200).json(Food);
  //   } catch (err) {
  //     next(err);
  //   }
  // };