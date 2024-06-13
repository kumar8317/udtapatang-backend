import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { cookieOptions, getDataUri, sendEmail, sendToken } from "../utils/features.js";
import cloudinary from "cloudinary";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  //Handle error
  if(!user){
    return next(new ErrorHandler("User does not exist", 400));
  }
  if (!password) {
    return next(new ErrorHandler("Please Enter Password", 400));
  }
  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Email or Password ", 400));
  }
  sendToken(user, res, `Welcome back, ${user.name}`, 200);
});

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User Already exists", 400));
  }
  let avatar = undefined;

  if (req.file) {
    //Add cloudinary
    const file = getDataUri(req.file);

    const myCloud = await cloudinary.v2.uploader.upload(file.content);

    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  user = await User.create({
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
    avatar,
  });
  sendToken(user, res, `Registered Successfully`, 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const updateProfile = asyncError(async (req, res, next) => {
  const user = req.user;
  const { name, email, address, city, country, pinCode } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCde = pinCode;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please Enter Old and New Password", 400));
  }
  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Old Password"), 400);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

export const updatePic = asyncError(async (req, res, next) => {
  const user = req.user;

  const file = getDataUri(req.file);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await user.save();
  res.status(200).json({
    success: true,
    message: "Avatar Updated Successfully",
  });
});


export const forgetPassword = asyncError(async (req, res, next) => {
    const {email} = req.body;
    console.log("aas",email)
    const user = await User.findOne({email});

    if(!user) return next(new ErrorHandler("Incorrect Email", 404));

    const randomNumber = Math.random()*(999999-100000)+100000;
    const otp = Math.floor(randomNumber);
    const otp_expire = 15*60*1000;
    
    user.otp = otp;
    user.otp_expire = new Date(Date.now()+otp_expire);
    await user.save();
    const message= `Your OTP for resetting password is ${otp}. Please ignore if it's not you.`;
    try {
        await sendEmail("OTP For Resetting Password",user.email,message)
    } catch (error) {
        user.otp = null;
        user.otp_expire = null;
        await user.save();

        return  next(error)
    }

    res.status(200).json({
      success: true,
      message: `Email sent To ${user.email} for OTP`,
    });
});


export const resetPassword = asyncError(async (req, res, next) => {

    const {otp,password} = req.body;
    const user = await User.findOne({otp,
        otp_expire: {
            $gt: Date.now()
        }
    });

    if(!user){
        return next(new ErrorHandler("Incorrect OTP or has been expired",400))
    }

    if(!password){
        return next(new ErrorHandler("Please enter new password",400))
    }
    user.password = password;
    user.otp = null;
    user.otp_expire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message:`Password Reset Successfully, You can login now`,
    });
});