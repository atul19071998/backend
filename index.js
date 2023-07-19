const mongoose = require('mongoose');
const dotenv = require("dotenv")
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(express.json());



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
