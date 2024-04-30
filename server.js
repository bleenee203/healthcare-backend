const express  = require('express')
const app  = express()
require('dotenv').config()
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000
const {
    AppErrorHandler,
    LostErrorHandler,
  } = require("./utils/exeptionHandlers/handler.js");
//parses incoming requests with JSON payloads - converts JSON to objects
app.disable("x-powered-by");
app.use(express.json())
app.use(cookieParser());
//config CORS
// app.use(
//     cors({
//       credentials: true,
//       origin: ORIGIN,
//       optionsSuccessStatus: 200,
//     })
//   );
//call database funtion
require('./config/db').connect()
//route import
const user = require('./routes/user')
app.use("/api/user",user)


// Handle unregistered route for all HTTP Methods
app.all("*", function (req, res, next) {
    // Forward to next closest middleware
    next();
  });
app.use(LostErrorHandler); // 404 error handler middleware
app.use(AppErrorHandler); // General app error handler

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})

  