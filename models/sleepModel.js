const { mongoose } = require("mongoose");
const moment = require("moment-timezone");
const sleepSchema = new mongoose.Schema({
    start_time:{
        type:Date,
        require: true,
    },
    end_time:{
        type:Date,
        require: true,
    },
    created_at:{
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

sleepSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        // ret.date = moment(ret.date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        // ret.updated_at = moment(ret.updated_at).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        const {id,start_time,end_time,created_at,updated_at,isDeleted,user_id} = ret
        return {id,start_time,end_time,created_at,updated_at,isDeleted,user_id}
    }
})
const Sleep = mongoose.model('sleeps',drinkSchema)
module.exports = Sleep