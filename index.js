const mongoose = require('mongoose');
const dotenv = require("dotenv")
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

dotenv.config({path:'./config.env'});
require('./db/conn');

// const User = require('./model/userSchema');

app.use(express.json());

//we link the router path 


app.use(require('./router/auth'))
const PORT = process.env.PORT;

 
app.listen(PORT ,() =>{
   console.log(`server is listening at ${PORT}`)
})
