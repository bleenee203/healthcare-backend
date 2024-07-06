const express = require('express')
const { createMeal, getAllFoodMealByDate, deleteFoodofMeal } = require('../controllers/mealController')
const { requireAuthentication } = require('../middlewares/authCheck')
const { getDrink } = require('../controllers/drinkController')
const router = express.Router()
router.post('/create-meal',requireAuthentication,createMeal)
router.get('/get-meal',getAllFoodMealByDate)
router.patch('/remove-food/:id',requireAuthentication,deleteFoodofMeal)
module.exports = router
