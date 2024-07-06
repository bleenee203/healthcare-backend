const { duration } = require("moment");
const { mongoose } = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    type: {
        type:String,
        requie:true
    },
    duration:{
        type:Number
    },
    distance:{
        type:Number,
    },
    calo_burn:{
        type:Number,
        require: true
    },
    date:{
        type:Date,
        require: true
    },
    start_time:{
        type:Date
    },
    updated_at:{
        type:Date,
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
})

exerciseSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        const {id,type,duration,distance,calo_burn,date,start_time,updated_at,user_id} = ret
        return {id,type,duration,distance,calo_burn,date,start_time,updated_at,user_id}
    }
})
const Exercise = mongoose.model('activities', exerciseSchema)
module.exports = Exercise