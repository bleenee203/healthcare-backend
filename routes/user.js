const express = require('express')
const router = express.Router()

//Handlers from controllers
const {signup,sendotp,login, logout, refreshAccessToken, forgotPassword, resetPassword} = require("../controllers/auth")
const {fetchAuthUserProfile} = require("../controllers/user")
const {requireAuthentication} = require("../middlewares/authCheck")
router.post('/signup',signup)
router.post('/sendotp',sendotp)
router.post('/login',login)
router.get('/me', requireAuthentication, fetchAuthUserProfile)
router.post('/logout',requireAuthentication,logout)
router.post("/reauth", refreshAccessToken)
// router.post(
//     "/forgotpass",
//     forgotPassword
// )
router.post('/forgotpass',forgotPassword,sendotp)
router.patch(
    "/resetpass",
    resetPassword
  )
module.exports = router