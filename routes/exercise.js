const express = require('express')
const { createExercise, getExerciseLog } = require('../controllers/exerciseController')
const router = express.Router()
router.post('/create-exercise',createExercise)
router.get('/get-exercise-week',getExerciseLog)
// router.patch('/remove-water-log/:id',deleteDrink)
module.exports = router
