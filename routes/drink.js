const express = require('express')
const { createDrink, deleteDrink, getWaterLog, getDrink } = require('../controllers/drinkController')
const router = express.Router()
router.post('/create-drink',createDrink)
router.get('/get-water-week',getWaterLog)
router.patch('/remove-water-log/:id',deleteDrink)
module.exports = router
