const { default: mongoose } = require("mongoose");
const meal = require("../models/mealModel");
const moment = require('moment');
module.exports.createMeal = async (req,res,next) =>{
    try{
        const {meal_type,date,amount,kcal,food_id} = req.body.newData
        console.log(req.body.newData)
        const user_id = req.body.userId
        const isDeleted=false
        const formatdate = moment(date, 'DD/MM/YYYY').add(12, 'hours').toDate();
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
// exports.updateFood = async (req, res, next) => {
//     try {
//       const  id  = req.params.id;
//       const { food_name,kcal,carbs,protein,fat,ration,avg_above} = req.body.newData;
//       const existingFood = await food.findOne({ food_name, _id: { $ne: id } }); 
//     if (existingFood) {
//       return res.status(400).json({ message: 'Food name already in use',success:false });
//     }
//       const updatedFood = await food.findByIdAndUpdate(id, { food_name,kcal,carbs,protein,fat,ration,avg_above}, { new: true });
//       if (!updatedFood) {
//         return res.status(404).json({ message: 'Food not found',success:false  });
//       }
//       return res.status(200).json({
//         success: true,
//         message: 'Food updated successfully',
//         data: updatedFood,
//       });
//     } catch (err) {
//       next(err);
//     }
//   };
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
//   exports.getAllUserFood = async (req, res, next) => {
//     try {
//       const user_id = req.params.id
//       if (!user_id) {
//         return res.status(400).json({
//           success: false,
//           message: 'User ID is required'
//         });
//       }  
//       const foods = await food.find({user_id,isDeleted:false})
//       return res.status(200).json({
//         success: true,
//         foods
//       });
//     } catch (err) {
//       next(err);
//     }
//   };
  exports.getAllFoodMealByDate = async (req, res, next) => {
    try {
      const {user_id,date} = req.query
      const formatdate = moment(date, 'DD/MM/YYYY').add(12, 'hours').toDate();
      console.log(formatdate);
      // const meals = await meal.find({date:formatdate,user_id:user_id,isDeleted:false})
          // Using aggregation to lookup food details
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
//   exports.getFoodByName = async (req, res, next) => {
//     try {
//       const { name } = req.query;
//       const regex  = new RegExp(name,'i');
//       const foods = await food.find({food_name:regex,isDeleted:false,user_id:null});
//       if (!foods) {
//         return res.status(404).json({ message: 'Food not found' });
//       }
//       res.json(foods);
//     } catch (err) {
//       next(err);
//     }
//   };
//   exports.getUserFoodByName = async (req, res, next) => {
//     try {
//       const { name,id } = req.query;
//       const regex  = new RegExp(name,'i');
//       const foods = await food.find({food_name:regex,isDeleted:false,user_id:id});
//       if (!foods) {
//         return res.status(404).json({ message: 'Food not found' });
//       }
//       res.json(foods);
//     } catch (err) {
//       next(err);
//     }
//   };