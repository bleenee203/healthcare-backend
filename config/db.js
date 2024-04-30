const mongoose = require ('mongoose');
require('dotenv').config();
exports.connect=()=>{
    mongoose.connect("mongodb://127.0.0.1:27017/healthcare-app",{
    }).then(()=>console.log('Connected to MongoDB'))
    .catch((err)=>console.error(
        'Fail to connect to MongoDB',err
    ));    
}

