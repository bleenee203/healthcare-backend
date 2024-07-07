const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'posts',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comments',
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
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  }
});

commentSchema.set("toJSON",{
    transform: function(doc,ret,options){
        ret.id = ret._id;
        const {id,post_id,content,comment_id,created_at,isDeleted,user_id} = ret
        return {id,post_id,content,comment_id,created_at,isDeleted,user_id}
    }
})
// Create and export the Post model
module.exports = mongoose.model('comments', postSchema);
