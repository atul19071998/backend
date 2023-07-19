 const jwt = require("jsonwebtoken");
 const User = require("../model/userSchema")

 const Authenticate = async(req,res,next) =>{
   try{
     const token = req.cookies.jwt;
    //  console.log(token ,"new authenticate");
     const verifyToken = jwt.verify(token,process.env.SECRET_key);

     const rootUser = await User.findOne({_id:verifyToken._id,"tokens.token":token})
      if(!rootUser){throw new Error('User not found')}
      req.token = token;
      req.rootUser = rootUser;
      req.userId = rootUser._id;
      req.email = rootUser.email;
      next();
    //  console.log(rootUser ,"authenticate")
    }catch(err){
    res.status(401).send('Unauthorized:No token Provided')
    console.log(err)
   }
 }

 module.exports = Authenticate;
