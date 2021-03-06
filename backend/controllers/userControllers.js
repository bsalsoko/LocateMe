const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});


//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     Get or Search all users
//@route           POST /api/user/location
//@access          Public
const postLocation = asyncHandler(async (req, res) => {
  const { lng , lat , time , value } =req.body;
  const user = await User.find({ _id : { $eq: req.user._id } });
  const timestamp = user[0].updatetimeStamp;
    if (user){
      const updateLocation = await User.updateMany({"_id":req.user._id},{$set: {"location" : { "type" : "Point", "coordinates" : [ lng, lat ] }}, "updatetimeStamp" : time });
      if (((time-timestamp)/60)<5){

        const userdai= await User.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [parseFloat(lng),parseFloat(lat)] },
              distanceField: "dist.calculated",
              maxDistance: parseFloat(value), spherical:true}
            
          }]);
      res.send(userdai);
     }
     else{
        res.status(404);
        throw new Error("NO Users Found Nearby");
     }
    };
});

module.exports = { allUsers, postLocation, registerUser, authUser } ;
