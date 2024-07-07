const { default: mongoose } = require("mongoose");
const meal = require("../models/mealModel");
const moment = require('moment');
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
module.exports.createMeal = async (req,res,next) =>{
    try{
        const {meal_type,amount,date,kcal,food_id} = req.body.newData
        console.log(req.body.newData)
        const user_id = req.body.userId
        const isDeleted=false
        const formatdate = moment.tz(date,systemTimeZone).toISOString()

        if(!meal_type){
            return res.status(403).send({
            success:false,
            message:"Please provide type of meal"});
        }
        const Meal =await meal.create({user_id,meal_type,date:formatdate,amount,kcal,food_id,isDeleted})
        return res.status(200).json({
            success: true,
            Meal,
            message: "Add food for meal successfully",
        })
    }catch(error){
        console.log(error)
        next(error)
    }
};
  exports.deleteFoodofMeal = async (req, res, next) => {
    try {
      const  id  = req.params.id;
      const updatedFood = await meal.findByIdAndUpdate(id, { isDeleted:true});
      if (!updatedFood) {
        return res.status(404).json({ message: 'Food not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Remove food successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  exports.getAllFoodMealByDate = async (req, res, next) => {
    try {
      const {user_id,date} = req.query
      console.log("mieal dat",date);
      const formatdate= moment.tz(date, systemTimeZone).toDate();
      console.log("mieal dat",formatdate);
    const meals = await meal.aggregate([
      {
        $match: {
          date: formatdate, 
          user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'foods', // name of the collection
          localField: 'food_id',
          foreignField: '_id',
          as: 'foodDetails'
        }
      },
      {
        $unwind: '$foodDetails'
      },
      {
        $project: {
          id: 1,  
          food_id: 1,
          food_name: '$foodDetails.food_name',
          ration: '$foodDetails.ration',
          carbs:'$foodDetails.carbs',
          protein:'$foodDetails.protein',
          fat:'$foodDetails.fat',
          meal_type:1,
          kcal:1,
          date:1,
          amount:1
        }
      }
    ]);
    console.log(meals)
      return res.status(200).json({
        success: true,
        "meals":meals
      });
    } catch (err) {
        console.log(err);
      next(err);
    }
  };