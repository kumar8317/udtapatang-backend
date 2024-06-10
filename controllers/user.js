import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  //Handle error
  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Password", 400));
  }
  res.status(200).json({
    sucess: true,
    message: `Welcome back, ${user.name}`,
  });
});

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } = req.body;

  //Add cloudinary

  await User.create({
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
  });
  res.status(201).json({
    sucess: true,
    message: " Registered Successfully",
  });
});
