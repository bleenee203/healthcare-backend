const { mongoose } = require("mongoose");

const foodSchema = new mongoose.Schema({
    food_name: {
        type:String,
        requie:true
    },
    kcal:{
        type:Number
    },
    carbs:{
        type:Number,
    },
    protein:{
        type:Number
    },
    fat:{
        type:Number
    },
    isDeleted:{
        type:Boolean
    }
})
foodSchema.set("toJSON",{
    transform: function(doc,ret,options){
        const {food_name,kcal,carbs,protein,fat,isDeleted} = ret
        return ret
    }
})
const Food = mongoose.model('foods',foodSchema)
module.exports = Food