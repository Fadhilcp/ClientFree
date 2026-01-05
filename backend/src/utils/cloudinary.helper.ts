import { UploadApiResponse, UploadApiOptions } from "cloudinary";
import cloudinary from "../config/cloudinary.config";
import streamifier from 'streamifier';

export const uploadToCloudinary = (file: Express.Multer.File,options: UploadApiOptions)
: Promise<UploadApiResponse> => {

  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      if (!result) return reject(new Error("Cloudinary upload failed"));
      
      resolve(result);
    });
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};