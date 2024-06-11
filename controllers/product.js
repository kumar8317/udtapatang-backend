import { asyncError } from "../middlewares/error.js";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const getAllProducts = asyncError(async (req, res, next) => {
  //Search and category query
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

export const getProductDetails = asyncError(async (req, res, next) => {
  //Search and category query
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

export const createProduct = asyncError(async (req, res, next) => {
  const { name, description, price, stock } = req.body;

  if (!req.file) {
    return next(new ErrorHandler("Please upload an image", 400));
  }
  const file = getDataUri(req.file);

  const myCloud = await cloudinary.v2.uploader.upload(file.content);

  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await Product.create({
    name,
    description,
    price,
    stock,
    images: [image],
  });

  res.status(200).json({
    success: true,
    message: `Product ${name} created successfully`,
  });
});

export const updateProduct = asyncError(async (req, res, next) => {
  const { name, description, price, stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: `Product updated successfully`,
  });
});

export const addProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please upload an image", 400));
  }
  const file = getDataUri(req.file);

  const myCloud = await cloudinary.v2.uploader.upload(file.content);

  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: `Image added successfully`,
  });
});

export const deleteProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Please provide image id", 400));
  }
  let isExists = -1;

  product.images.forEach((image, index) => {
    if (image._id.toString() === id.toString()) {
      isExists = index;
    }
  });
  if (isExists < 0) {
    return next(new ErrorHandler("Image not found", 404));
  }

  await cloudinary.v2.uploader.destroy(product.images[isExists].public_id);
  product.images.splice(isExists, 1);
  await product.save();

  res.status(200).json({
    success: true,
    message: `Image deleted successfully`,
  });
});

export const deleteProduct = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }

  await Product.deleteOne({_id:product._id})

  res.status(200).json({
    success: true,
    message: `Product deleted successfully`,
  });
});

export const addCategory = asyncError(async (req, res, next) => {
  const {category} = req.body;

  await Category.create({
    category
  })

  res.status(201).json({
    success: true,
    message: `Category added successfully`,
  })
})

export const getAllCategories = asyncError(async (req, res, next) => {
  const categories  = await Category.find({});

  res.status(200).json({
    success: true,
    categories
  })
})

export const deleteCategory = asyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if(!category){
    return next(new ErrorHandler("Category not found",404))
  }

  const products = await Product.find({category:category._id});


  for(let index = 0; index < products.length; index++){
    const product = products[i];
    product.category = undefined;

    await product.save()
  }

  await Category.deleteOne({_id:category._id})

  res.status(200).json({
    success: true,
    message: `Category deleted successfully`,
  })
})

export const getAdminProducts = asyncError(async (req, res, next) => {
  //Search and category query
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});