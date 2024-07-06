const { mongoose } = require("mongoose");
const moment = require("moment-timezone");
const drinkSchema = new mongoose.Schema({
    amount: {
        type:Number,
        require:true
    },
    date:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
    isDeleted:{
        type:Boolean
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
})

drinkSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        const {id,amount,date,updated_at,isDeleted,user_id} = ret
        return {id,amount,date,updated_at,isDeleted,user_id}
    }
})
const Drink = mongoose.model('drinks',drinkSchema)
module.exports = Drink