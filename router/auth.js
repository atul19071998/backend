const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
require("../db/conn");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Authenticate = require("../middleware/authenticate");
const User = require("../model/userSchema");
const Cart = require("../model/cartSchema");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const { MongoClient } = require("mongodb");
const EmptyCart = require("../model/EmptyCardSchema");
 const corsOptions = {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

router.use(cors(corsOptions));
router.use(cookieParser());
 


router.get("/", Authenticate, (req, res) => {
  res.status(200).json({ success: true, message: "user Authenticate" });
});
router.get("/swapnil", (req, res) => {
  res.status(201).json({ success: true, message: "swapnil true" });
});
async function FindData() {
  const uri =
    "mongodb+srv://atulnew:topology@cluster0.yylrcsq.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  await client.connect();
  let result = await client
    .db("BookAPI")
    .collection("mybooks")
    .find()
    .toArray();

  return result;
}

router.get("/book", async (req, res) => {
  let books = await FindData();
  res.json(books);
});

 

router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: " pls filled the field property " });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: " Email already exist  " });
    } else if (password !== cpassword) {
      return res.status(422).json({ error: "password are not match" });
    } else {
      const user = new User({ name, email, phone, work, password, cpassword });

      //yaha pe
      await user.save();

      //creating a  empty cart when user regsiter

      const emptyCartCreate = new EmptyCart({ email: email });
      const createdCartResult = await emptyCartCreate.save();

      console.log(createdCartResult);
      res.status(201).json({ message: "user registered successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

//login route

router.post("/signin", async (req, res) => {
  console.log(req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "pls filled the data" });
    }
    const userLogin = await User.findOne({ email: email });
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      if (!isMatch) {
        res.status(400).json({ error: "Invalid Credentials" });
      } else {
        let token = await userLogin.generateAuthToken();
        // console.log(token,"token generate")
        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
        });
        res.json({ message: "user Signin Succesfully" });
      }
    } else {
      res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
  }
});

//Razorpay post request
let razorpay = new Razorpay({
  key_id: "rzp_test_R2BlDSLfrUygz6",
  key_secret: "7gH1V0RlnGvZq7wkZachTBUR",
});
router.post("/razorpay", async (req, res) => {
  const payment_capture = 1;
  // const currency = "INR";

  let options = {
    amount: 500,
    currency: "INR",
    receipt: shortid.generate(),
    payment_capture,
  };
  try {
    const response = await razorpay.orders.create(options);
    // console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
      receipt: response.receipt,
    });
  } catch (e) {
    console.log(e);
  }
});
router.get("/atul", (req, res) => {
  res.send("hello atul")
});

router.get("/contact", (req, res) => {
  res.cookie("jwt", "atul");
});
router.get("/about", Authenticate, (req, res) => {
  // console.log(req.rootUser);
  res.send(req.rootUser);
});
router.get("/logout", Authenticate, async (req, res) => {
  // console.log(`hello my logout page`);
  res.clearCookie("jwt", { path: "/" });
  await req.rootUser.save();
  res.status(200).send(`user Logout`);
});

router.get("/userdetails", Authenticate, async (req, res) => {
  // console.log(req.userId + "xyz")
  const user = await User.findOne({ _id: req.userId.toString() });
  res.status(200).json({ user });
});

router.get("/useremails", Authenticate, async (req, res) => {
  res.status(200).json(req.rootUser);
});

router.post("/placeorder", async (req, res) => {
  let { userEmail, card, response } = req.body;
  //  console.log(userEmail,card,response,"the npm");
  card.forEach(async (cartItem) => {
    await Cart.updateOne(
      { email: userEmail },
      {
        $push: {
          items: cartItem,
        },
      }
    )
      .then((value) => console.log(value))
      .catch((err) => console.log(err));
  });

  res.json({ message: "success" });
});
// previus user order route
router.get("/orders", Authenticate, async (req, res) => {
  let userEmail = req.rootUser.email;
  const orderHistory = await Cart.findOne({ email: userEmail });
  res.json({ orderHistory });
});

module.exports = router;
