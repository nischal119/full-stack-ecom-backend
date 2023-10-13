import mongoose from "mongoose";

const dbURL =
  "mongodb+srv://dhungeln12:nischal2468@school.clw64jm.mongodb.net/ecommerce?retryWrites=true&w=majority";
export const dbConnect = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log("DB connection : OK");
  } catch (error) {
    console.log("DB connection failed");
    console.log(error.message);
  }
};
