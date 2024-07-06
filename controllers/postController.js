const post = require("../models/postModel");
module.exports.createPost = async (req,res,next) =>{
    try{
        const {title,content,image,created_at} = req.body.newData
        console.log(req.body.newData)
        const user_id = req.body.userId
        const isDeleted=false;
        if(!title){
            return res.status(403).send({
            success:false,
            message:"Please provide title"});
        }
        if(content==null){
            return res.status(403).send({
            success:false,
            message:"Please provide content"});
        }
        // const existingFood = await food.findOne({food_name})
        // console.log(existingFood);
        // if(existingFood){
        //     return res.status(400).json({
        //         success:false,
        //         message:"Food already exists"
        //     })
        // }
        const number_cmt = 0

        const Post =await post.create({user_id,title,content,image,created_at,isDeleted,number_cmt})
        return res.status(200).json({
            success: true,
            Post,
            message: "Post created successfully",
        })
    }catch(error){
        console.log(error)
        next(error)
    }
};
exports.updatePost = async (req, res, next) => {
    try {
      const  id  = req.params.id;
      const { number_cmt, isDeleted} = req.body.newData;
    //   const existingFood = await food.findOne({ food_name, _id: { $ne: id } }); 
    // if (existingFood) {
    //   return res.status(400).json({ message: 'Food name already in use',success:false });
    // }
      const updatedPost = await post.findByIdAndUpdate(id, { number_cmt, isDeleted}, { new: true });
      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found',success:false  });
      }
      return res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: updatedPost,
      });
    } catch (err) {
      next(err);
    }
  };
  exports.deletePost = async (req, res, next) => {
    try {
      const  id  = req.params.id;
      const updatedPost = await post.findByIdAndUpdate(id, { isDeleted:true});
      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  exports.getAllPost = async (req, res, next) => {
    try {
      const posts = await post.find({user_id:null,isDeleted:false})
      return res.status(200).json({
        success: true,
        "posts":posts
      });
    } catch (err) {
      next(err);
    }
  };

  exports.getPostById = async (req, res, next) => {
    try {
      const { id } = req.query;
    //   const regex  = new RegExp(name,'i');
      const posts = await post.find({id:id,isDeleted:false,user_id:null});
      if (!posts) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(posts);
    } catch (err) {
      next(err);
    }
  };
