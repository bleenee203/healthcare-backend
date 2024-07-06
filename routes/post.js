const express = require('express')
const { createPost, updatePost, deletePost, getAllPost, getpostById, getPostById } = require('../controllers/postController')
const { requireAuthentication } = require('../middlewares/authCheck')
const router = express.Router()
router.post('/create-post',createPost)
router.patch('/update-post/:id',requireAuthentication,updatePost)
router.patch('/delete-post/:id',requireAuthentication,deletePost)
router.get('/get-all-post',getAllPost)
router.get('/get-post/:id',getPostById)
// router.get('/get-food/:id',getFoodById)
module.exports = router
