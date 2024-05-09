const express = require('express')
const router = express.Router()

//Handlers from controllers
const {signup,sendotp,login, logout, refreshAccessToken, forgotPassword, resetPassword, verifyotp, changePass} = require("../controllers/auth")
const {fetchAuthUserProfile} = require("../controllers/user")
const {requireAuthentication} = require("../middlewares/authCheck")
router.post('/signup',signup)
router.post('/sendotp',sendotp)
router.post('/login',login)
router.get('/me', requireAuthentication, fetchAuthUserProfile)
router.post('/logout',requireAuthentication,logout)
router.post("/reauth", refreshAccessToken)
router.post('/verifyotp',verifyotp)
router.post('/forgotpass',forgotPassword,sendotp)
router.patch(
    "/resetpass",
    resetPassword
  )
router.patch(
  "/changepass",requireAuthentication,changePass
)
module.exports = router