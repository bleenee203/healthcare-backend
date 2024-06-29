const { mongoose } = require("mongoose");

const foodSchema = new mongoose.Schema({
    food_name: {
        type:String,
        requie:true
    },
    kcal:{
        type:Number,
        require:true
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
    },
    ration:{
        type:Number,
        require:true
    },
    avg_above:{
        type:Number,
        require:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
})

foodSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        const {id,food_name,kcal,carbs,protein,fat,isDeleted,ration,avg_above,user_id} = ret
        return {id,food_name,kcal,carbs,protein,fat,isDeleted,ration,avg_above,user_id}
    }
})
const Food = mongoose.model('foods',foodSchema)
module.exports = Food