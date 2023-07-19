const mongoose = require('mongoose');
//for connecting database.
const DB  =  process.env.DATABASE;
mongoose.connect(DB).then(() =>{
    console.log(`connection succesfull`)
 }).catch((err) => console.log(`error not connected`))