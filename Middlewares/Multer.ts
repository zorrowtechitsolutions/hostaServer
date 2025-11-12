import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import Hospital from "../Model/HospitalSchema";
import createError from "http-errors";
import path from "path";
import userModel from "../Model/UserSchema";

const storage = multer.diskStorage({});
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = (req: Request, res: Response): Promise<any> => {
  return new Promise((resolve, reject) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(req.file);
    });
  });
};

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const file = await uploadFile(req, res);

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found!");
  }

  // If there's an existing image, delete it from Cloudinary
  if (hospital.image?.public_id) {
    await cloudinary.uploader.destroy(hospital.image.public_id);
  }

  if (file) {
    const normalizedPath = path.normalize(file.path);
    const result = await cloudinary.uploader.upload(normalizedPath);

    hospital.image = {
      imageUrl: result.secure_url,
      public_id: result.public_id,
    };
    await hospital.save();

    return res.status(200).json({ imageUrl: result.secure_url });
  } else {
    throw new createError.BadRequest("No file uploaded!");
  }
};

export const uploadProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { name } = req.body;

  const file = await uploadFile(req, res);

  const user = await userModel.findById(id);
  if (!user) {
    throw new createError.NotFound("User not found!");
  }

  // Update name even if no file
  if (name) {
    user.name = name;
  }

  if (file) {
    // delete old image if exists
    if (user.picture?.public_id) {
      await cloudinary.uploader.destroy(user.picture.public_id);
    }

    const normalizedPath = path.normalize(file.path);
    const result = await cloudinary.uploader.upload(normalizedPath);

    user.picture = {
      imageUrl: result.secure_url,
      public_id: result.public_id,
    };
  }

  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully",
    user, // return whole updated user, not just image
  });
};
