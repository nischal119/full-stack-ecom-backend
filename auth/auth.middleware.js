import jwt from "jsonwebtoken";
import { User } from "../user/user.entity.js";

// is seller middleware
export const isSeller = async (req, res, next) => {
  // extract token from headers

  const authorization = req?.headers?.authorization;
  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 && splittedArray[1];

  // if not token, terminate
  if (!token) {
    return res.status(401).send({ message: "Unauthorized. hello" });
  }

  // decrypt token and extract email
  try {
    const userData = jwt.verify(token, "abchfjghearjgherpigh");

    // find user by email
    const user = await User.findOne({ _id: userData._id });

    // if not user, terminate
    if (!user) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    // if user role is not seller
    if (user.role !== "seller") {
      return res.status(401).send({ message: "Unauthorized." });
    }

    // add user to req
    req.loggedInUser = user;

    next();
  } catch (error) {
    // if something goes wrong while  decrypting, terminate
    return res.status(401).send({ message: "Unauthorized." });
  }
};

// is buyer
export const isBuyer = async (req, res, next) => {
  // ?phase 1:authorize user
  // extract token from headers
  const authorization = req?.headers?.authorization;
  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 && splittedArray[1];
  //   console.log(token);

  // if not token, terminate
  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  // decrypt token and extract email
  try {
    const userData = jwt.verify(token, "abchfjghearjgherpigh");

    // find user by email
    const user = await User.findOne({ _id: userData._id });

    // if not user, terminate
    if (!user) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    // if user role is not buyer, terminate
    if (user.role !== "buyer") {
      return res.status(401).send({ message: "Unauthorized." });
    }

    next();
  } catch (error) {
    // if something goes wrong while  decrypting, terminate
    console.log(error.message);
    return res.status(401).send({ message: "Unauthorized." });
  }
};

// is seller middleware
export const isUser = async (req, res, next) => {
  // extract token from headers
  const authorization = req?.headers?.authorization;
  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 && splittedArray[1];

  // if not token, terminate
  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  // decrypt token and extract email
  try {
    const userData = jwt.verify(token, "abchfjghearjgherpigh");

    // find user by email
    const user = await User.findOne({ _id: userData._id });

    // if not user, terminate
    if (!user) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    // add user to req
    req.userInfo = user;

    next();
  } catch (error) {
    // if something goes wrong while  decrypting, terminate
    return res.status(401).send({ message: "Unauthorized." });
  }
};
