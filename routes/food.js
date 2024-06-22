const express = require('express')
const { createFood, updateFood, deleteFood, getAllFood, getFoodByName } = require('../controllers/foodController')
const router = express.Router()
router.post('/create-food',createFood)
router.patch('/update-food/:id',updateFood)
router.patch('/delete-food/:id',deleteFood)
router.get('/get-all-food',getAllFood)
router.get('/get-food',getFoodByName)
module.exports = router
