const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  number_cmt: {
    type: Number,
    required: true,
    default: 0
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  }
});

postSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        const {id,title,content,image,created_at,isDeleted,number_cmt,user_id} = ret
        return {id,title,content,image,created_at,isDeleted,number_cmt,user_id}
    }
})
// Create and export the Post model
module.exports = mongoose.model('posts', postSchema);
