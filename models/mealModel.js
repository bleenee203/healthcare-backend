const { mongoose } = require("mongoose");

const mealSchema = new mongoose.Schema({
    meal_type: {
        type:String,
        requie:true
    },
    date:{
        type:Date,
        require:true
    },
    amount:{
        type:Number,
    },
    kcal:{
        type:Number
    },
    isDeleted:{
        type:Boolean
    },
    food_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'foods'
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
})

mealSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        const {id,meal_type,date,amount,kcal,isDeleted,food_id,user_id} = ret
        return {id,meal_type,date,amount,kcal,isDeleted,food_id,user_id}
    }
})
const Meal = mongoose.model('meal_diaries',mealSchema)
module.exports = Meal