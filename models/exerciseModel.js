const { duration } = require("moment");
const { mongoose } = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    type: {
        type:String,
        requie:true
    },
    duration:{
        type:Number,
        require:true
    },
    distance:{
        type:Number,
    },
    calo_burn:{
        type:Number
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
const Exercise = mongoose.model('exercises', exerciseSchema)
module.exports = Exercise