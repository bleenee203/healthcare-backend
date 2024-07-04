const express = require('express')
const router = express.Router()

//Handlers from controllers
const {signup,sendotp,login, logout, refreshAccessToken, forgotPassword, resetPassword, verifyotp, changePass, sendotpforchangepass} = require("../controllers/authController")
const {fetchAuthUserProfile, updateUserData} = require("../controllers/userController")
const {requireAuthentication} = require("../middlewares/authCheck")
router.post('/signup',signup)
router.post('/sendotp',sendotp)
router.post('/login',login)
router.post('/me', requireAuthentication, fetchAuthUserProfile)
router.post('/logout',requireAuthentication,logout)
router.post("/reauth", refreshAccessToken)
router.post('/verifyotp',verifyotp)
router.post('/forgotpass',forgotPassword,sendotpforchangepass)
router.patch(
    "/resetpass",
    resetPassword
  )
router.patch(
  "/changepass",requireAuthentication,changePass
)
router.patch('/update-user',requireAuthentication,updateUserData)
module.exports = router