import express from "express";
import {
  deleteReview,
  editReview,
  getHospitals,
  postReview,
  resetPassword,
  userData,
  userLogin,
  userRegister,
  login,
  verifyOtp,
  aUserData,
    saveExpoToken,
    getReviews,
    getReviewsAHospital, 
} from "../Controllers/UserSide/UserForm";
import { trycatch } from "../Utils/TryCatch";
import Auth from "../Middlewares/Authenticator";
import {  uploadProfile } from "../Middlewares/Multer";


const userRoutes = express.Router();

userRoutes.post("/users/registeration", trycatch(userRegister));
userRoutes.post("/users/login", trycatch(userLogin));
userRoutes.post("/users/login/phone", trycatch(login));
userRoutes.post("/users/password", Auth, trycatch(resetPassword));
userRoutes.get("/users", Auth, trycatch(userData));
userRoutes.get("/users/:id",  trycatch(aUserData));
userRoutes.put("/users/:id", trycatch( uploadProfile));
userRoutes.get("/hospitals", trycatch(getHospitals));

userRoutes.get("/reviews", trycatch(getReviews));
userRoutes.get("/reviews/hospital/:id", trycatch(getReviewsAHospital));
userRoutes.post("/reviews", trycatch(postReview));
userRoutes.put("/reviews/:id", trycatch(editReview));
userRoutes.delete("/reviews/:id", trycatch(deleteReview));

userRoutes.post("/users/otp", trycatch(verifyOtp));
userRoutes.post("/users/:id/token", trycatch(saveExpoToken));




export default userRoutes;
