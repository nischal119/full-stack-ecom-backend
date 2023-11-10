import express from "express";
import { isBuyer } from "../auth/auth.middleware.js";
import { Product } from "../product/product.entity.js";
import { Cart } from "./cart.entity.js";
import { checkMongooseIdValidity } from "../utils/utils.js";
import mongoose from "mongoose";
import { actionValidationSchema } from "./cart.validation.js";

const router = express.Router();

// add item to cart

router.post("/cart/add/item", isBuyer, async (req, res) => {
  const { productId, quantity } = req.body;

  //   validate this data
  // check if product id is mongoid
  //   check if product with id exists
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  if (quantity > product.quantity) {
    return res.status(403).send({ message: "Product is out of stock." });
  }

  //   add item to cart of that buyer
  const buyerId = req.loggedInUser?._id;

  //check if the product already exists in cart

  const cartHasProduct = await Cart.findOne({
    buyerId: buyerId,
    "productList.productId": productId,
  });
  const isValidMongoId = checkMongooseIdValidity(productId);

  if (cartHasProduct) {
    await Cart.updateOne(
      {
        buyerId: buyerId,
        "productList.productId": productId,
      },
      {
        $inc: {
          "productList.$.quantity": quantity,
        },
      }
    );
  } else {
    await Cart.updateOne(
      {
        buyerId: buyerId,
      },
      {
        $push: {
          productList: {
            productId: new mongoose.Types.ObjectId(productId),
            quantity,
          },
        },
      },
      {
        upsert: true,
      }
    );
  }
  if (!isValidMongoId)
    return res.status(400).send({ message: "Invalid Mongo id" });

  return res
    .status(200)
    .send({ message: "Item is added to cart successfully." });
});

router.put("/cart/remove/item/:id", isBuyer, async (req, res) => {
  const userId = req.loggedInUser?._id;

  const productId = req.params.id;

  //   mongo id validation

  // TODO: empty cart
  await Cart.updateOne(
    { buyerId: userId },
    {
      $pull: {
        productList: {},
      },
    }
  );

  return res.status(200).send({ message: "Item is removed from cart." });
});

router.put("/cart/update/quantity/:id", isBuyer, async (req, res) => {
  const body = req.body;

  const productId = req.params.id;

  // mongo id validation and new quantity validation
  try {
    await actionValidationSchema.validateAsync(body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // validdate product id

  const isValidMongoId = checkMongooseIdValidity(productId);

  if (!isValidMongoId) {
    return res.status(400).send({ message: "Invalid Mongo id 11" });
  }
  // check product existence
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }
  //calculate new quanity
  const newQuantity =
    body.action === "increase" ? product.quantity + 1 : product.quantity - 1;

  if (newQuantity <= 0) {
    return res.status(400).send({ message: "Invalid quantity" });
  }
  // buyer is logged in user
  const buyerId = req?.loggedInUser?._id;
  await Cart.updateOne(
    {
      buyerId: buyerId,
      "productList.productId": productId,
    },
    {
      $set: {
        "productList.$.quantity": newQuantity,
      },
    }
  );

  return res.status(200).send({ message: "Cart is updated successfully." });
});
router.get("/cart/details", isBuyer, async (req, res) => {
  const loggedInUserId = req?.loggedInUser?._id;
  let cartList = await Cart.aggregate([
    {
      $match: {
        buyerId: loggedInUserId,
      },
    },
    {
      $unwind: "$productList",
    },
    {
      $lookup: {
        from: "products",
        localField: "productList.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $project: {
        name: { $first: "$productDetails.name" },
        brand: { $first: "$productDetails.brand" },
        company: { $first: "$productDetails.company" },
        unitPrice: { $first: "$productDetails.price" },
        availableQuantity: { $first: "$productDetails.quantity" },
        orderQuantity: "$productList.quantity",
        productId: { $first: "$productDetails._id" },
      },
    },
  ]);
  cartList = cartList.map((item) => {
    const totalPrice = item.unitPrice * item.orderQuantity;
    return { ...item, totalPrice };
  });
  let grandTotal = 0;
  cartList.forEach((item) => {
    grandTotal += item.totalPrice;
  });

  return res.status(200).send({ cartList, grandTotal });
});

router.get("/cart/count", isBuyer, async (req, res) => {
  let itemCount = 0;
  const loggedInUserId = req.loggedInUser?._id;

  const cart = await Cart.findOne({ buyerId: loggedInUserId });

  if (!cart) {
    itemCount = 0;
  } else {
    itemCount = cart?.productList?.length;
  }

  return res.status(200).send({ itemCount });
});
export default router;
